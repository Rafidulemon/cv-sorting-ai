import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import JSZip from "jszip";
import { createHash, webcrypto } from "crypto";
import {
  CvProcessingStatus,
  FileProvider,
  QueueJob,
  QueueName,
  QueueStatus,
  Prisma,
} from "@prisma/client";
import { CvPipeline } from "../services/cv/cv.pipeline";
import { EmbeddingService } from "../services/embedding/embedding.service";
import prisma from "../utils/prisma";

type StorageConfig = {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  publicBaseUrl?: string;
  provider: FileProvider;
};

const MAX_ENTRY_BYTES = 20 * 1024 * 1024; // 20MB per CV
const allowedExtensions: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  txt: "text/plain",
};

@Injectable()
export class CvQueueRunner implements OnModuleInit, OnModuleDestroy {
  private active = 0;
  private stopped = false;
  private concurrency = 2;

  constructor(
    private readonly config: ConfigService,
    private readonly cvPipeline: CvPipeline,
    private readonly embeddingService: EmbeddingService,
  ) {}

  onModuleInit() {
    this.concurrency = Number(this.config.get("worker.concurrency") ?? 2);
    this.loop();
  }

  onModuleDestroy() {
    this.stopped = true;
  }

  private async loop() {
    while (!this.stopped) {
      if (this.active >= this.concurrency) {
        await this.sleep(200);
        continue;
      }

      let job: QueueJob | null = null;
      try {
        job = await this.claimNext();
      } catch (error) {
        // If we can't obtain a transaction/connection, back off briefly before retrying.
        await this.sleep(500);
        continue;
      }
      if (!job) {
        await this.sleep(400);
        continue;
      }

      this.active += 1;
      this.handle(job).finally(() => {
        this.active -= 1;
      });
    }
  }

  private async claimNext(): Promise<QueueJob | null> {
    return prisma.$transaction(
      async (tx) => {
        const next = await tx.queueJob.findFirst({
          where: {
            queue: QueueName.CV_PIPELINE,
            status: { in: [QueueStatus.PENDING, QueueStatus.QUEUED] },
          },
          orderBy: { createdAt: "asc" },
        });

        if (!next) return null;

        const updated = await tx.queueJob.update({
          where: { id: next.id },
          data: { status: QueueStatus.PROCESSING, startedAt: new Date(), attempts: { increment: 1 } },
        });

        return updated;
      },
      {
        maxWait: 20_000, // wait up to 20s for a free connection
        timeout: 30_000, // give the transaction up to 30s to run
      },
    );
  }

  private resolveStorage(): StorageConfig | null {
    const bucket = process.env.S3_BUCKET;
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION ?? "auto";
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const sessionToken = process.env.S3_TOKEN_VALUE;
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

    if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
      return null;
    }

    const normalizedEndpoint = endpoint.toLowerCase();
    const provider = normalizedEndpoint.includes("r2") || normalizedEndpoint.includes("cloudflarestorage")
      ? FileProvider.R2
      : FileProvider.S3;

    const allowSessionToken = sessionToken && provider === FileProvider.S3;

    return {
      bucket,
      endpoint,
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken: allowSessionToken ? sessionToken : undefined,
      publicBaseUrl,
      provider,
    };
  }

  private async handle(job: QueueJob) {
    const storage = this.resolveStorage();
    if (!storage) {
      await this.failJob(job.id, "Storage not configured");
      return;
    }

    const payload = (job.payload || {}) as Record<string, unknown>;
    const kind =
      (payload.kind as string) ||
      (payload.zipKey ? "zip-upload" : payload.resumeId ? "resume-processing" : "zip-upload");

    try {
      if (kind === "resume-processing") {
        await this.handleResumeProcessing(job, payload, storage);
      } else {
        await this.handleZipIngest(job, payload, storage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Job failed";
      await this.failJob(job.id, message);
    }
  }

  private async handleZipIngest(job: QueueJob, payload: Record<string, unknown>, storage: StorageConfig) {
    const zipKey = String(payload.zipKey || "");
    const jobId = job.jobId;
    const orgId = job.organizationId;
    const uploaderId = job.userId;

    if (!zipKey || !jobId || !orgId) {
      await this.failJob(job.id, "Missing zipKey, jobId, or organizationId in payload");
      return;
    }

    try {
      const zipBuffer = await this.downloadZip(zipKey, storage);
      const zip = await JSZip.loadAsync(zipBuffer, { checkCRC32: true });
      const entries = Object.values(zip.files).filter(
        (entry) => !entry.dir && !this.isAppleDoubleFile(entry.name) && this.detectContentType(entry.name),
      );

      if (!entries.length) {
        await this.failJob(job.id, "ZIP contained no supported CV files");
        return;
      }

      const successes: { fileId: string; resumeId: string; name: string }[] = [];
      const failures: { name: string; reason: string }[] = [];

      for (const entry of entries) {
        const safeName = this.sanitizeFileName(entry.name);
        const contentType = this.detectContentType(safeName);
        if (!contentType) continue;

        const buffer = await entry.async("nodebuffer");
        if (buffer.byteLength > MAX_ENTRY_BYTES) {
          failures.push({ name: safeName, reason: "exceeds 20MB limit" });
          continue;
        }

        try {
          const objectKey = ["uploads", "job-candidates", orgId, jobId, `${Date.now()}-${safeName}`].join("/");

          await this.uploadBufferToStorage({
            buffer,
            key: objectKey,
            contentType,
            storage,
          });

          const checksum = createHash("sha256").update(buffer).digest("hex");
          const candidateName = this.deriveCandidateName(safeName);

          const { record, resume } = await prisma.$transaction(async (tx) => {
            const record = await tx.fileObject.create({
              data: {
                organizationId: orgId,
                key: objectKey,
                bucket: storage.bucket,
                provider: storage.provider,
                region: storage.region,
                mimeType: contentType,
                size: buffer.byteLength,
                checksum,
                uploadedById: uploaderId || undefined,
                metadata: {
                  originalName: safeName,
                  source: "zip-upload",
                },
              },
              select: {
                id: true,
                key: true,
                mimeType: true,
                size: true,
                createdAt: true,
              },
            });

            const candidate = await tx.candidate.create({
              data: {
                organizationId: orgId,
                fullName: candidateName,
                source: "upload",
              },
              select: { id: true },
            });

            const resume = await tx.resume.create({
              data: {
                organizationId: orgId,
                candidateId: candidate.id,
                jobId,
                fileId: record.id,
                uploadedById: uploaderId || undefined,
                status: CvProcessingStatus.UPLOADED,
              },
              select: { id: true },
            });

            return { record, resume };
          });

          successes.push({ fileId: record.id, resumeId: resume.id, name: safeName });
        } catch (entryError) {
          const reason = entryError instanceof Error ? entryError.message : "upload failed";
          failures.push({ name: safeName, reason });
        }
      }

      if (successes.length) {
        const nextRequirements = this.deriveRequirements(
          (
            await prisma.job.findUnique({
              where: { id: jobId },
              select: { requirements: true },
            })
          )?.requirements ?? null,
          successes.map((s) => s.fileId),
          successes.map((s) => s.resumeId),
        );

        await prisma.job.update({
          where: { id: jobId },
          data: {
            requirements: nextRequirements,
            lastActivityAt: new Date(),
          },
        });
      }

      const status = successes.length ? QueueStatus.COMPLETED : QueueStatus.FAILED;

      await prisma.queueJob.update({
        where: { id: job.id },
        data: {
          status,
          completedAt: status === QueueStatus.COMPLETED ? new Date() : null,
          failedAt: status === QueueStatus.FAILED ? new Date() : null,
          result: {
            uploaded: successes.length,
            failed: failures.length,
            successes,
            failures,
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process CV ZIP";
      await this.failJob(job.id, message);
    } finally {
      try {
        await this.deleteObject(zipKey, storage);
      } catch {
        // ignore cleanup failures
      }
    }
  }

  private async handleResumeProcessing(job: QueueJob, payload: Record<string, unknown>, storage: StorageConfig) {
    const resumeId = String(payload.resumeId || "");
    if (!resumeId || !job.jobId || !job.organizationId) {
      await this.failJob(job.id, "Missing resumeId, jobId, or organizationId in payload");
      return;
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        file: true,
        job: {
          select: {
            id: true,
            organizationId: true,
            title: true,
            description: true,
            previewHtml: true,
            requirements: true,
            embedding: { select: { embedding: true } },
          },
        },
      },
    });

    if (!resume || resume.organizationId !== job.organizationId || !resume.file) {
      await this.failJob(job.id, "Resume not found for organization");
      return;
    }

    const jobSkills =
      resume.job?.requirements &&
      typeof resume.job.requirements === "object" &&
      !Array.isArray(resume.job.requirements) &&
      Array.isArray((resume.job.requirements as Record<string, unknown>).skills)
        ? ((resume.job.requirements as Record<string, unknown>).skills as unknown[])
            .map((item) => (typeof item === "string" ? item : String(item)))
            .filter(Boolean)
        : [];

    const jobTextRaw = resume.job?.description || resume.job?.previewHtml || resume.job?.title || "";
    const jobText = jobTextRaw.replace(/<[^>]*>/g, " ");
    const jobEmbedding =
      resume.job?.embedding?.embedding ??
      (await this.ensureJobEmbedding(resume.job?.id ?? null, jobText, jobSkills));

    try {
      const fileBuffer = await this.downloadObject(resume.file.key, storage);
      const pipelineResult = await this.cvPipeline.process({
        buffer: fileBuffer,
        mimeType: resume.file.mimeType,
        fileName: resume.file.key?.split("/").pop() ?? "resume.pdf",
        jobEmbedding: jobEmbedding ?? undefined,
        jobSkills,
      });

      const extractedFields = {
        ...pipelineResult.extractedFields,
        parsedJson: pipelineResult.parsedJson,
        textSource: pipelineResult.textSource,
      };

      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          extractedText: pipelineResult.text,
          extractedFields,
          status: CvProcessingStatus.EMBEDDING,
          errorMessage: null,
          ocrStartedAt: pipelineResult.textSource === "OCR" ? new Date() : resume.ocrStartedAt,
        },
      });

      await prisma.resumeEmbedding.deleteMany({ where: { resumeId } });
      if (pipelineResult.chunkEmbeddings.length) {
        const uniqueChunks = Array.from(
          new Map(
            pipelineResult.chunkEmbeddings.map((chunk) => [chunk.chunkIndex, chunk]),
          ).values(),
        );

        await prisma.resumeEmbedding.createMany({
          data: uniqueChunks.map(({ chunkIndex, text, embedding }) => ({
            resumeId,
            chunkIndex,
            text,
            embedding,
          })),
          skipDuplicates: true, // avoid race-induced unique constraint errors
        });
      }

      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: CvProcessingStatus.COMPLETED,
          extractedFields,
          overallScore: pipelineResult.score.overallScore,
          scoreBreakdown: pipelineResult.score.breakdown as Prisma.InputJsonValue,
          processedAt: new Date(),
          lastScoredAt: new Date(),
        },
      });

      await prisma.queueJob.update({
        where: { id: job.id },
        data: {
          status: QueueStatus.COMPLETED,
          completedAt: new Date(),
          result: { resumeId, textSource: pipelineResult.textSource },
        },
      });

      if (resume.jobId) {
        await prisma.job.update({
          where: { id: resume.jobId },
          data: {
            cvAnalyzedCount: { increment: 1 },
            lastActivityAt: new Date(),
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process resume";
      await prisma.resume.update({
        where: { id: resumeId },
        data: { status: CvProcessingStatus.FAILED, errorMessage: message },
      });
      await this.failJob(job.id, message);
    }
  }

  private async ensureJobEmbedding(jobId: string | null, jobText: string, jobSkills: string[]) {
    if (!jobId) return null;

    const existing = await prisma.jobEmbedding.findUnique({
      where: { jobId },
      select: { embedding: true },
    });
    if (existing?.embedding?.length) return existing.embedding;

    const text = [jobText.trim(), jobSkills.join(", ")].filter(Boolean).join("\n");
    const embedding = await this.embeddingService.embed(text || "job");

    await prisma.jobEmbedding.upsert({
      where: { jobId },
      update: { embedding },
      create: { jobId, embedding },
    });

    return embedding;
  }

  private async downloadObject(key: string, storage: StorageConfig) {
    const url = storage.publicBaseUrl
      ? `${storage.publicBaseUrl.replace(/\/+$/, "")}/${key}`
      : await this.presignGetUrl({ ...storage, key });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download object (${response.status})`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private async failJob(jobId: string, message: string) {
    await prisma.queueJob.update({
      where: { id: jobId },
      data: {
        status: QueueStatus.FAILED,
        failedAt: new Date(),
        error: message,
      },
    });
  }

  private detectContentType(fileName: string) {
    const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() ?? "" : "";
    return allowedExtensions[extension] ?? null;
  }

  private sanitizeFileName(raw: string) {
    const base = raw.split(/[/\\]/).pop() ?? raw;
    const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "-");
    return cleaned.length ? cleaned : "upload";
  }

  private deriveCandidateName(fileName: string) {
    const base = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
    const cleaned = base.replace(/[-_]+/g, " ").trim();
    return cleaned.length ? cleaned : "Unknown Candidate";
  }

  private isAppleDoubleFile(path: string) {
    const normalized = path.replace(/\\/g, "/");
    const segments = normalized.split("/");
    const basename = segments[segments.length - 1] || normalized;

    if (segments.some((segment) => segment === "__MACOSX")) return true;
    if (basename.startsWith("._")) return true;
    return false;
  }

  private deriveRequirements(
    current: unknown,
    uploadedIds: string[],
    resumeIds: string[],
  ) {
    const base =
      current && typeof current === "object" && !Array.isArray(current)
        ? { ...(current as Record<string, unknown>) }
        : {};
    const existing = Array.isArray((base as Record<string, unknown>).resumeFileIds)
      ? ((base as Record<string, unknown>).resumeFileIds as unknown[])
          .map((value) => (typeof value === "string" ? value : String(value)))
      : [];
    const existingResumeIds = Array.isArray((base as Record<string, unknown>).resumeIds)
      ? ((base as Record<string, unknown>).resumeIds as unknown[])
          .map((value) => (typeof value === "string" ? value : String(value)))
      : [];

    const mergedFiles = Array.from(new Set([...existing, ...uploadedIds]));
    const mergedResumes = Array.from(new Set([...existingResumeIds, ...resumeIds]));
    return { ...base, resumeFileIds: mergedFiles, resumeIds: mergedResumes };
  }

  private async downloadZip(key: string, storage: StorageConfig) {
    const url = storage.publicBaseUrl
      ? `${storage.publicBaseUrl.replace(/\/+$/, "")}/${key}`
      : await this.presignGetUrl({ ...storage, key });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ZIP (${response.status})`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private async uploadBufferToStorage(params: {
    buffer: Buffer;
    key: string;
    contentType: string;
    storage: StorageConfig;
  }) {
    const uploadUrl = await this.presignPutUrl({
      endpoint: params.storage.endpoint,
      bucket: params.storage.bucket,
      key: params.key,
      contentType: params.contentType,
      region: params.storage.region,
      accessKeyId: params.storage.accessKeyId,
      secretAccessKey: params.storage.secretAccessKey,
      sessionToken: params.storage.sessionToken,
    });

    const uploadBody = new Uint8Array(params.buffer);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": params.contentType },
      body: uploadBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorText || "Unknown error"}`);
    }
  }

  private async deleteObject(key: string, storage: StorageConfig | null) {
    if (!storage) return;
    const deleteUrl = await this.presignDeleteUrl({
      endpoint: storage.endpoint,
      bucket: storage.bucket,
      key,
      region: storage.region,
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
      sessionToken: storage.sessionToken,
    });

    const response = await fetch(deleteUrl, { method: "DELETE" });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete zip (${response.status})`);
    }
  }

  private async presignGetUrl(options: {
    endpoint: string;
    bucket: string;
    key: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  }) {
    const endpoint = options.endpoint.replace(/\/+$/, "");
    const url = new URL(endpoint);
    const host = url.host;
    const encodedKey = options.key
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    const canonicalUri = `/${options.bucket}/${encodedKey}`;
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${options.region}/s3/aws4_request`;
    const signedHeaders = "host";

    const queryParams: [string, string][] = [
      ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
      ["X-Amz-Credential", `${options.accessKeyId}/${credentialScope}`],
      ["X-Amz-Date", amzDate],
      ["X-Amz-Expires", String(15 * 60)],
      ["X-Amz-SignedHeaders", signedHeaders],
    ];

    if (options.sessionToken) {
      queryParams.push(["X-Amz-Security-Token", options.sessionToken]);
    }

    const canonicalQuerystring = queryParams
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");

    const canonicalHeaders = `host:${host}\n`;
    const payloadHash = "UNSIGNED-PAYLOAD";

    const canonicalRequest = [
      "GET",
      canonicalUri,
      canonicalQuerystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      await this.sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = await this.getSignatureKey(options.secretAccessKey, dateStamp, options.region, "s3");
    const signature = await this.hmacSha256(signingKey, stringToSign);
    const signatureHex = Array.from(signature)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return `${endpoint}${canonicalUri}?${canonicalQuerystring}&X-Amz-Signature=${signatureHex}`;
  }

  private async presignDeleteUrl(options: {
    endpoint: string;
    bucket: string;
    key: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  }) {
    const endpoint = options.endpoint.replace(/\/+$/, "");
    const url = new URL(endpoint);
    const host = url.host;
    const encodedKey = options.key
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    const canonicalUri = `/${options.bucket}/${encodedKey}`;
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${options.region}/s3/aws4_request`;
    const signedHeaders = "host";

    const queryParams: [string, string][] = [
      ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
      ["X-Amz-Credential", `${options.accessKeyId}/${credentialScope}`],
      ["X-Amz-Date", amzDate],
      ["X-Amz-Expires", String(10 * 60)],
      ["X-Amz-SignedHeaders", signedHeaders],
    ];

    if (options.sessionToken) {
      queryParams.push(["X-Amz-Security-Token", options.sessionToken]);
    }

    const canonicalQuerystring = queryParams
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");

    const canonicalHeaders = `host:${host}\n`;
    const payloadHash = "UNSIGNED-PAYLOAD";

    const canonicalRequest = [
      "DELETE",
      canonicalUri,
      canonicalQuerystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      await this.sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = await this.getSignatureKey(options.secretAccessKey, dateStamp, options.region, "s3");
    const signature = await this.hmacSha256(signingKey, stringToSign);
    const signatureHex = Array.from(signature)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return `${endpoint}${canonicalUri}?${canonicalQuerystring}&X-Amz-Signature=${signatureHex}`;
  }

  private async presignPutUrl(options: {
    endpoint: string;
    bucket: string;
    key: string;
    contentType: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  }) {
    const endpoint = options.endpoint.replace(/\/+$/, "");
    const url = new URL(endpoint);
    const host = url.host;
    const encodedKey = options.key
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    const canonicalUri = `/${options.bucket}/${encodedKey}`;
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${options.region}/s3/aws4_request`;
    const signedHeaders = "content-type;host";

    const queryParams: [string, string][] = [
      ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
      ["X-Amz-Credential", `${options.accessKeyId}/${credentialScope}`],
      ["X-Amz-Date", amzDate],
      ["X-Amz-Expires", String(15 * 60)],
      ["X-Amz-SignedHeaders", signedHeaders],
      ["X-Amz-Content-Sha256", "UNSIGNED-PAYLOAD"],
    ];

    if (options.sessionToken) {
      queryParams.push(["X-Amz-Security-Token", options.sessionToken]);
    }

    const canonicalQuerystring = queryParams
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");

    const canonicalHeaders = `content-type:${options.contentType}\nhost:${host}\n`;
    const payloadHash = "UNSIGNED-PAYLOAD";

    const canonicalRequest = [
      "PUT",
      canonicalUri,
      canonicalQuerystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      await this.sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = await this.getSignatureKey(options.secretAccessKey, dateStamp, options.region, "s3");
    const signature = await this.hmacSha256(signingKey, stringToSign);
    const signatureHex = Array.from(signature)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return `${endpoint}${canonicalUri}?${canonicalQuerystring}&X-Amz-Signature=${signatureHex}`;
  }

  private async sha256Hex(value: string) {
    const hash = await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  private async hmacSha256(key: ArrayBuffer | Uint8Array, data: string) {
    const rawKey: ArrayBuffer = key instanceof ArrayBuffer ? key : new Uint8Array(key).buffer;
    const cryptoKey = await webcrypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await webcrypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
    return new Uint8Array(signature);
  }

  private async getSignatureKey(secretKey: string, dateStamp: string, region: string, service: string) {
    const kDate = await this.hmacSha256(new TextEncoder().encode(`AWS4${secretKey}`), dateStamp);
    const kRegion = await this.hmacSha256(kDate, region);
    const kService = await this.hmacSha256(kRegion, service);
    return this.hmacSha256(kService, "aws4_request");
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
