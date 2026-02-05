import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Worker, QueueEvents, Job } from "bullmq";
import IORedis from "ioredis";
import { QdrantClient, type Schemas } from "@qdrant/js-client-rest";
import { CvProcessingStatus, SortingState, JobStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import { EmbeddingService } from "../services/embedding/embedding.service";

type SortJobPayload = {
  jobId: string;
  organizationId: string;
  userId?: string | null;
  topCandidates?: number | null;
};

@Injectable()
export class SortingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SortingWorker.name);
  private worker: Worker<SortJobPayload> | null = null;
  private events: QueueEvents | null = null;
  private connection: IORedis | null = null;
  private readonly queueName = "cv-sorting";
  private readonly prefix: string;
  private readonly concurrency: number;
  private readonly qdrant: QdrantClient | null;
  private readonly qdrantUrl: string | null;
  private readonly qdrantApiKey: string | null;

  constructor(private readonly embeddingService: EmbeddingService) {
    this.prefix = process.env.QUEUE_PREFIX || "carrix";
    this.concurrency = Number(process.env.QUEUE_CONCURRENCY_SORTING || 3);
    const qdrantUrlRaw = process.env.QDRANT_URL || "http://localhost:6333";
    this.qdrantUrl = qdrantUrlRaw || null;
    this.qdrantApiKey = process.env.QDRANT_API_KEY || null;
    const isHttps = qdrantUrlRaw?.startsWith("https://");
    const apiKeyForClient = isHttps ? this.qdrantApiKey || undefined : undefined;
    if (this.qdrantApiKey && !isHttps) {
      this.logger.warn(
        "QDRANT_API_KEY is set but QDRANT_URL is not https; skipping api key to avoid insecure connection.",
      );
    }
    this.qdrant = qdrantUrlRaw ? new QdrantClient({ url: qdrantUrlRaw, apiKey: apiKeyForClient }) : null;
  }

  async onModuleInit() {
    try {
      const connection = this.getConnection();
      this.events = new QueueEvents(this.queueName, { connection, prefix: this.prefix });
      this.worker = new Worker<SortJobPayload>(
        this.queueName,
        async (job) => this.handle(job.data),
        {
          connection,
          prefix: this.prefix,
          concurrency: this.concurrency,
        },
      );

      this.worker.on("failed", (job: Job<SortJobPayload> | undefined, err: Error) => {
        this.logger.error(`Sorting job ${job?.id} failed: ${err.message}`);
      });
      this.worker.on("completed", (job: Job<SortJobPayload>, result: unknown) => {
        this.logger.log(`Sorting job ${job.id} completed`, result);
      });
      this.logger.log(`Sorting worker online (queue=${this.queueName}, prefix=${this.prefix})`);
    } catch (error) {
      this.logger.error(`Failed to start sorting worker: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.events?.close();
    await this.connection?.quit();
  }

  private getConnection() {
    if (this.connection) return this.connection;
    const url =
      process.env.LOCAL_REDIS_URL ||
      process.env.REDIS_URL ||
      (process.env.UPSTASH_REDIS_REST_URL
        ? process.env.UPSTASH_REDIS_REST_URL.replace("https://", "rediss://")
        : null);
    if (!url) {
      throw new Error("REDIS_URL missing for BullMQ sorting worker");
    }
    this.connection = new IORedis(url, {
      maxRetriesPerRequest: null,
      tls: url.startsWith("rediss://") ? {} : undefined,
    });
    return this.connection;
  }

  private async handle(payload: SortJobPayload) {
    if (!this.qdrant) {
      throw new Error("Qdrant client is not configured");
    }
    const qdrant = this.qdrant as QdrantClient;

    const { jobId, organizationId, topCandidates } = payload;
    if (!jobId || !organizationId) {
      throw new Error("jobId and organizationId are required");
    }

    try {
      const job = await prisma.job.findFirst({
        where: { id: jobId, organizationId },
        select: {
          id: true,
          organizationId: true,
          title: true,
          description: true,
          previewHtml: true,
          embedding: true,
          requirements: true,
          tags: true,
          minEducation: true,
          ageMin: true,
          ageMax: true,
        },
      });

      if (!job) {
        throw new Error("Job not found for sorting");
      }

      const resumes = await prisma.resume.findMany({
        where: {
          jobId,
          organizationId,
          status: CvProcessingStatus.COMPLETED,
        },
        select: {
          id: true,
          scoreBreakdown: true,
          overallScore: true,
          extractedFields: true,
          candidate: {
            select: {
              yearsExperience: true,
              location: true,
            },
          },
        },
      });

      if (!resumes.length) {
        await prisma.job.update({
          where: { id: jobId },
          data: { sortingState: SortingState.NOT_STARTED, status: JobStatus.ACTIVE },
        });
        return { ranked: 0, reason: "No processed resumes" };
      }

      let jobEmbedding = job.embedding?.embedding;
      if (!jobEmbedding?.length) {
        const fallbackText = [job.description ?? "", job.previewHtml ?? "", job.title ?? ""].filter(Boolean).join("\n");
        jobEmbedding = await this.embeddingService.embed(fallbackText || "job");
        if (jobEmbedding.length) {
          await prisma.jobEmbedding.upsert({
            where: { jobId },
            update: { embedding: jobEmbedding },
            create: { jobId, embedding: jobEmbedding },
          });
        }
      }

      if (!jobEmbedding?.length) {
        throw new Error("Job embedding missing; cannot sort");
      }

      await this.ensureCollection(`job-${jobId}`, jobEmbedding.length);

      const resumeEmbeddings = await prisma.resumeEmbedding.findMany({
        where: { resumeId: { in: resumes.map((r) => r.id) } },
        orderBy: { chunkIndex: "asc" },
        select: { resumeId: true, embedding: true },
      });

      const vectors = this.aggregateEmbeddings(resumeEmbeddings, jobEmbedding.length);
      if (!vectors.length) {
        throw new Error("No usable resume embeddings found");
      }

      const collectionName = `job-${jobId}`;
      const qdrantPayload = vectors
        .map((item: { resumeId: string; embedding: number[] }) => {
          const { sanitized, hadInvalid } = this.sanitizeVector(item.embedding, jobEmbedding.length);
          if (hadInvalid) {
            this.logger.warn(`Non-finite values detected in embedding for resumeId=${item.resumeId}; sanitized to 0`);
          }
          return {
            id: this.toUuid(item.resumeId),
            vector: sanitized,
            payload: { resumeId: item.resumeId },
          };
        })
        .filter((item) => item.vector.length === jobEmbedding.length);

      const upsertOrRetry = async (allowRetry: boolean) => {
        try {
          this.logger.log(
            `Upserting into Qdrant collection=${collectionName} vectors=${qdrantPayload.length} dim=${jobEmbedding.length}`,
          );
          await qdrant.upsert(collectionName, { points: qdrantPayload });
        } catch (error) {
          this.logger.error(
            `Qdrant upsert failed (collection=${collectionName}, points=${qdrantPayload.length}, dim=${jobEmbedding.length}): ${this.describeQdrantError(error)}`,
          );
          await this.debugUpsert(collectionName, qdrantPayload);
          if (allowRetry && this.isBadRequest(error)) {
            // Hard reset the collection once, then retry
            await this.forceRecreateCollection(collectionName, jobEmbedding.length, "upsert 400 retry");
            return upsertOrRetry(false);
          }
          throw error;
        }
      };

      await upsertOrRetry(true);

      const limit = Math.min(topCandidates ?? vectors.length, vectors.length);
      const searchOrRetry = async (allowRetry: boolean): Promise<Schemas["ScoredPoint"][]> => {
        try {
          return await qdrant.search(collectionName, {
            vector: jobEmbedding,
            limit,
            with_payload: true,
          });
        } catch (error) {
          this.logger.error(
            `Qdrant search failed (collection=${collectionName}, limit=${limit}, dim=${jobEmbedding.length}): ${this.describeQdrantError(error)}`,
          );
          if (allowRetry && this.isBadRequest(error)) {
            await this.forceRecreateCollection(collectionName, jobEmbedding.length, "search 400 retry");
            return searchOrRetry(false);
          }
          throw error;
        }
      };

      const searchResults = await searchOrRetry(true);

      const resumeMap = new Map(resumes.map((r) => [r.id, r]));

      const requiredSkills: string[] =
        (Array.isArray((job.requirements as Record<string, unknown> | null | undefined)?.skills)
          ? ((job.requirements as { skills?: unknown[] }).skills as unknown[]).map((s) => String(s).trim()).filter(Boolean)
          : job.tags) ?? [];

      const minEducation = (job.minEducation || "").toLowerCase().trim() || null;
      const ageMin = job.ageMin ?? null;
      const ageMax = job.ageMax ?? null;

      const rankedResumeIds = searchResults
        .map((item, index: number) => {
          const resumeId = String((item.payload as { resumeId?: string } | undefined)?.resumeId ?? "");
          const simScore = item.score ?? 0;
          const resume = resumeMap.get(resumeId);
          const fields = (resume?.extractedFields as Record<string, unknown> | null | undefined) ?? {};
          const resumeSkillsRaw = Array.isArray((fields as { skills?: unknown[] }).skills)
            ? ((fields as { skills?: unknown[] }).skills as unknown[]).map((s) => String(s).toLowerCase().trim())
            : [];
          const educationRaw = Array.isArray((fields as { education?: unknown[] }).education)
            ? ((fields as { education?: unknown[] }).education as unknown[]).map((s) => String(s).toLowerCase())
            : [];
          const matchedSkills = requiredSkills.filter((req) =>
            resumeSkillsRaw.includes(req.toLowerCase()),
          );
          const skillMatch = requiredSkills.length
            ? matchedSkills.length / requiredSkills.length
            : 1;
          const educationMatch = minEducation
            ? educationRaw.some((e) => e.includes(minEducation))
              ? 1
              : 0
            : 1;
          const estYears =
            typeof (fields as { totalYears?: unknown }).totalYears === "number"
              ? ((fields as { totalYears?: number }).totalYears as number)
              : resume?.candidate?.yearsExperience ?? null;
          const estAge = typeof estYears === "number" ? estYears + 22 : null;
          const ageFit =
            ageMin === null && ageMax === null
              ? 1
              : estAge === null
                ? 1 // unknown age → don’t penalize
                : (ageMin === null || estAge >= ageMin) && (ageMax === null || estAge <= ageMax)
                  ? 1
                  : 0;

          const composite =
            0.6 * simScore +
            0.3 * skillMatch +
            0.1 * educationMatch;
          const finalScore = ageFit === 1 ? composite : composite * 0.85;

          return {
            resumeId,
            simScore,
            score: finalScore,
            rank: index + 1,
            breakdown: {
              simScore,
              skillMatch,
              educationMatch,
              ageFit,
              matchedSkills,
              missingSkills: requiredSkills.filter((r) => !matchedSkills.includes(r)),
            },
          };
        })
        .filter((item) => item.resumeId);

      const now = new Date();
      await prisma.$transaction([
        prisma.job.update({
          where: { id: jobId },
          data: {
            sortingState: SortingState.COMPLETED,
            status: JobStatus.SORTED,
            cvSortedCount: rankedResumeIds.length,
            lastActivityAt: now,
          },
        }),
        ...rankedResumeIds.map((item) =>
          prisma.resume.update({
            where: { id: item.resumeId },
            data: {
              overallScore: item.score ?? undefined,
              scoreBreakdown: {
                qdrantScore: item.simScore ?? null,
                rank: item.rank,
                simScore: item.simScore ?? null,
                skillMatch: item.breakdown?.skillMatch ?? null,
                educationMatch: item.breakdown?.educationMatch ?? null,
                ageFit: item.breakdown?.ageFit ?? null,
                matchedSkills: item.breakdown?.matchedSkills ?? [],
                missingSkills: item.breakdown?.missingSkills ?? [],
              },
              lastScoredAt: now,
            },
          }),
        ),
      ]);

      return { ranked: rankedResumeIds.length };
    } catch (error) {
      try {
        await prisma.job.update({
          where: { id: jobId },
          data: { sortingState: SortingState.NOT_STARTED },
        });
      } catch {
        // ignore update failure
      }
      throw error;
    }
  }

  private async ensureCollection(collectionName: string, vectorSize: number) {
    if (!this.qdrant) return;

    const extractVectorSize = (info: unknown): number | null => {
      const candidates = [
        (info as { result?: { config?: { params?: { vectors?: unknown } }; params?: { vectors?: unknown } } }).result
          ?.config?.params?.vectors,
        (info as { result?: { config?: { params?: { vectors?: unknown } }; params?: { vectors?: unknown } } }).result
          ?.params?.vectors,
        (info as { config?: { params?: { vectors?: unknown } }; params?: { vectors?: unknown } }).config?.params?.vectors,
        (info as { config?: { params?: { vectors?: unknown } }; params?: { vectors?: unknown } }).params?.vectors,
      ];

      for (const vectors of candidates) {
        if (!vectors) continue;
        const size =
          typeof (vectors as { size?: number }).size === "number"
            ? (vectors as { size?: number }).size
            : typeof (vectors as { default?: { size?: number } }).default?.size === "number"
              ? (vectors as { default?: { size?: number } }).default!.size
              : null;
        if (size) return size;
      }
      return null;
    };

    const recreateCollection = async (reason: string) => {
      await this.forceRecreateCollection(collectionName, vectorSize, reason);
    };

    const existing = await this.qdrant.getCollections();
    const exists = existing?.collections?.some((c: { name?: string }) => c.name === collectionName);

    if (exists) {
      try {
        const info = await this.qdrant.getCollection(collectionName);
        const currentSize = extractVectorSize(info);
        this.logger.log(
          `Qdrant collection ${collectionName} exists with dim=${currentSize ?? "unknown"}; target=${vectorSize}`,
        );
        // Recreate collection if the stored vector dimension differs (avoids Qdrant 400 BadRequest errors)
        if (!currentSize || currentSize !== vectorSize) {
          await recreateCollection(`mismatched dimension (current=${currentSize ?? "unknown"})`);
        }
      } catch (error) {
        // If any error, attempt recreation as a safe fallback
        await recreateCollection(`read collection failed: ${this.describeQdrantError(error)}`);
      }
      return;
    }

    this.logger.log(`Creating Qdrant collection ${collectionName} with dim=${vectorSize}`);
    await this.qdrant.createCollection(collectionName, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
  }

  private aggregateEmbeddings(
    rows: { resumeId: string; embedding: number[] }[],
    targetDimension: number,
  ) {
    const byResume = new Map<string, number[][]>();

    rows.forEach((row) => {
      if (!row.embedding?.length || row.embedding.length !== targetDimension) return;
      if (!byResume.has(row.resumeId)) byResume.set(row.resumeId, []);
      byResume.get(row.resumeId)?.push(row.embedding);
    });

    const averaged: { resumeId: string; embedding: number[] }[] = [];

    for (const [resumeId, vectors] of byResume.entries()) {
      if (!vectors.length) continue;
      const sums = new Array(targetDimension).fill(0);
      vectors.forEach((vector) => {
        for (let i = 0; i < targetDimension; i += 1) {
          sums[i] += vector[i] ?? 0;
        }
      });
      averaged.push({
        resumeId,
        embedding: sums.map((value) => value / vectors.length),
      });
    }

    return averaged;
  }

  private sanitizeVector(vector: number[], expectedLength: number) {
    const sanitized = vector
      .slice(0, expectedLength)
      .map((value) => (Number.isFinite(value) ? value : 0));
    const hadInvalid = sanitized.length !== vector.length || sanitized.some((v) => !Number.isFinite(v));
    // If vector was shorter, pad with zeros
    while (sanitized.length < expectedLength) sanitized.push(0);
    return { sanitized, hadInvalid };
  }

  // Deterministic UUID (version 5–like) from an arbitrary string so Qdrant accepts point ids.
  private toUuid(value: string) {
    const crypto = require("node:crypto");
    const hash = crypto.createHash("sha1").update(value).digest(); // 20 bytes
    const bytes = Buffer.from(hash.slice(0, 16)); // use first 16
    // Set version (5) and variant (RFC 4122)
    bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5 (0b0101 << 4)
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

    const hex = bytes.toString("hex");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  private isBadRequest(error: unknown) {
    if (!error || typeof error !== "object") return false;
    const asAny = error as { response?: { status?: number }; message?: string };
    return asAny.response?.status === 400 || asAny.message?.toLowerCase().includes("bad request");
  }

  private async debugUpsert(collectionName: string, payload: unknown) {
    if (!this.qdrantUrl) return;
    try {
      const url = `${this.qdrantUrl.replace(/\/$/, "")}/collections/${collectionName}/points?wait=true`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(this.qdrantApiKey ? { "api-key": this.qdrantApiKey } : {}),
        },
        body: JSON.stringify({ points: payload }),
      });
      const text = await response.text();
      this.logger.error(
        `Qdrant debug upsert response status=${response.status} body=${text.slice(0, 500)}`,
      );
    } catch (err) {
      this.logger.error(`Qdrant debug upsert failed: ${this.describeQdrantError(err)}`);
    }
  }

  private async forceRecreateCollection(collectionName: string, vectorSize: number, reason: string) {
    if (!this.qdrant) return;
    this.logger.warn(
      `Force recreating Qdrant collection ${collectionName} (target dim=${vectorSize}) reason=${reason}`,
    );
    await this.qdrant.deleteCollection(collectionName).catch(() => undefined);
    await this.qdrant.createCollection(collectionName, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
  }

  private describeQdrantError(error: unknown): string {
    if (!error || typeof error !== "object") return String(error);
    const asAny = error as {
      name?: string;
      message?: string;
      response?: { data?: unknown; status?: number; statusText?: string; headers?: unknown };
      config?: unknown;
      code?: string;
      stack?: string;
    };

    const parts: string[] = [];
    if (asAny.name) parts.push(`name=${asAny.name}`);
    if (asAny.message) parts.push(`message=${asAny.message}`);
    if (asAny.code) parts.push(`code=${asAny.code}`);

    const data = asAny.response?.data;
    if (data !== undefined) {
      try {
        parts.push(`data=${JSON.stringify(data)}`);
      } catch {
        parts.push(`data=${String(data)}`);
      }
    }

    if (asAny.response?.status) {
      parts.push(
        `status=${asAny.response.status}${asAny.response.statusText ? ` ${asAny.response.statusText}` : ""}`,
      );
    }

    // Always append a detailed inspect snapshot to expose hidden fields (body, cause, stack)
    try {
      const util = require("node:util");
      parts.push(`detail=${util.inspect(error, { depth: 4, breakLength: 160, getters: true })}`);
    } catch {
      // ignore inspect failure
    }

    return parts.join(" | ");
  }
}
