import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { EmploymentType, Prisma } from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthToken = {
  id?: string;
  organizationId?: string;
};

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
const DEFAULT_MODEL = process.env.OPENAI_JD_MODEL ?? "gpt-4o-mini";
const INPUT_COST_PER_1K = Number(process.env.OPENAI_INPUT_RATE_PER_1K ?? "0.00015");
const OUTPUT_COST_PER_1K = Number(process.env.OPENAI_OUTPUT_RATE_PER_1K ?? "0.0006");
const NULL_CHAR_PATTERN = /\u0000/g;

const requestSchema = z.object({
  jobId: z.string().trim().optional(),
  text: z.string().trim().min(30, "Provide a job description to process"),
  source: z.enum(["upload", "paste"]),
  fileName: z.string().trim().max(180).optional(),
  uploadedDescriptionFile: z.string().trim().max(320).optional(),
});

const jobSelect: Prisma.JobSelect = {
  id: true,
  title: true,
  status: true,
  sortingState: true,
  description: true,
  previewHtml: true,
  requirements: true,
  seniority: true,
  tags: true,
  employmentType: true,
  locations: true,
  openings: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  lastActivityAt: true,
  createdAt: true,
  updatedAt: true,
};

function normalizeList(values?: string[]) {
  return (
    values
      ?.map((value) => stripNullCharacters(value).replace(/^[•\-]\s*/, "").trim())
      .filter(Boolean) ?? []
  );
}

function stripNullCharacters(value: string) {
  // Postgres rejects strings containing the null character; remove them proactively.
  return value.replace(NULL_CHAR_PATTERN, "");
}

function convertTextToPreviewHtml(text: string) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const lines = text.split(/\r?\n/);
  const parts: string[] = [];
  let listOpen = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const isBullet = /^[-•]/.test(line);

    if (isBullet) {
      if (!listOpen) {
        parts.push("<ul>");
        listOpen = true;
      }
      const cleaned = line.replace(/^[-•]\s*/, "");
      parts.push(`<li>${escapeHtml(cleaned)}</li>`);
      continue;
    }

    if (listOpen) {
      parts.push("</ul>");
      listOpen = false;
    }

    if (!line.length) continue;
    parts.push(`<p>${escapeHtml(line)}</p>`);
  }

  if (listOpen) {
    parts.push("</ul>");
  }

  return `<div>${parts.join("")}</div>`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function getSessionContext(request: NextRequest) {
  const token = (await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  })) as AuthToken | null;

  const userId = token?.id;
  const tokenOrgId = token?.organizationId;

  if (!userId) {
    return { userId: null, organizationId: null };
  }

  const membership = await prisma.membership.findFirst({
    where: tokenOrgId ? { userId, organizationId: tokenOrgId } : { userId },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true },
  });

  return {
    userId,
    organizationId: tokenOrgId ?? membership?.organizationId ?? null,
  };
}

function deriveTitle(text: string, fallbackName?: string | null) {
  const byLine = text.split(/\r?\n/).map((line) => line.trim()).find((line) => line.length > 10);
  if (byLine) {
    return byLine.replace(/^[•\-]\s*/, "").slice(0, 180);
  }

  if (fallbackName) {
    const withoutExt = fallbackName.includes(".")
      ? fallbackName.slice(0, fallbackName.lastIndexOf("."))
      : fallbackName;
    const cleaned = withoutExt.replace(/[-_]+/g, " ").trim();
    if (cleaned.length) return cleaned.slice(0, 180);
  }

  return "Untitled role";
}

type StructuredJd = {
  title?: string;
  summary?: string;
  description?: string;
  responsibilities?: string[];
  skills?: string[];
  seniority?: string;
  employmentType?: string;
};

async function parseWithOpenAi(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const client = new OpenAI({ apiKey });
  const model = DEFAULT_MODEL;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Extract structured fields from the job description. Respond ONLY with JSON matching the schema: {\"title\": string, \"summary\": string, \"description\": string, \"responsibilities\": string[], \"skills\": string[], \"seniority\": string, \"employmentType\": string}. Keep strings concise and plain text.",
      },
      { role: "user", content: `Job description:\n${text}` },
    ],
  });

  const usage = completion.usage ?? null;
  const promptTokens = usage?.prompt_tokens ?? 0;
  const completionTokens = usage?.completion_tokens ?? 0;
  const totalTokens = usage?.total_tokens ?? promptTokens + completionTokens;
  const totalCost = (promptTokens / 1000 * INPUT_COST_PER_1K + completionTokens / 1000 * OUTPUT_COST_PER_1K)*125;
  console.info(
    `[jobs/process-jd] OpenAI ${model} tokens prompt=${promptTokens} completion=${completionTokens} total=${
      totalTokens
    } approxCost=৳${totalCost.toFixed(6)}`,
  );

  const content = completion.choices[0]?.message?.content ?? "{}";
  let parsed: StructuredJd = {};
  try {
    parsed = JSON.parse(content) as StructuredJd;
  } catch {
    throw new Error("Failed to parse AI response");
  }

  return { structured: parsed, usage };
}

function coerceEmploymentType(value?: string | null) {
  if (!value) return undefined;
  const normalized = value.toUpperCase().replace(/\s+/g, "_");
  const match = Object.values(EmploymentType).find(
    (option) => option === normalized || option === normalized.replace(/-/, "_"),
  );
  return match as EmploymentType | undefined;
}

function buildRequirements(options: {
  existing?: Prisma.JsonValue | null;
  responsibilities: string[];
  skills: string[];
  source: "upload" | "paste";
  uploadedDescriptionFile?: string | null;
  summary?: string | null;
  rawTextSample?: string;
}) {
  const base =
    options.existing && typeof options.existing === "object" && !Array.isArray(options.existing)
      ? { ...(options.existing as Prisma.JsonObject) }
      : {};

  if (options.responsibilities.length) base.responsibilities = options.responsibilities;
  if (options.skills.length) base.skills = options.skills;
  base.source = options.source;
  base.summary = options.summary ?? base.summary;
  if (options.uploadedDescriptionFile?.trim()) {
    base.uploadedDescriptionFile = options.uploadedDescriptionFile;
  }
  if (options.rawTextSample) {
    base.rawTextSample = options.rawTextSample;
  }
  base.parsedWith = "openai";
  base.parsedAt = new Date().toISOString();

  return base as Prisma.InputJsonValue;
}

export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);
    if (!context.userId || !context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const sanitizedText = stripNullCharacters(parsed.data.text);
    const safeFileName = parsed.data.fileName
      ? stripNullCharacters(parsed.data.fileName)
      : parsed.data.fileName;
    const uploadedDescriptionFile = parsed.data.uploadedDescriptionFile
      ? stripNullCharacters(parsed.data.uploadedDescriptionFile)
      : parsed.data.uploadedDescriptionFile;

    const trimmed = sanitizedText.trim();
    const clippedText = trimmed.slice(0, 12000);

    const existingJob = parsed.data.jobId
      ? await prisma.job.findFirst({
          where: { id: parsed.data.jobId, organizationId: context.organizationId },
          select: { id: true, requirements: true },
        })
      : null;

    if (parsed.data.jobId && !existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { structured } = await parseWithOpenAi(clippedText);
    const responsibilities = normalizeList(structured.responsibilities);
    const skills = normalizeList(structured.skills);
    const employmentType = coerceEmploymentType(
      stripNullCharacters(structured.employmentType ?? "").trim() || undefined,
    );
    const seniority = stripNullCharacters(structured.seniority ?? "").trim() || undefined;
    const title =
      stripNullCharacters(structured.title?.trim() ?? "") || deriveTitle(clippedText, safeFileName);
    const summary =
      stripNullCharacters(
        structured.summary?.trim() ||
          structured.description?.trim() ||
          clippedText.slice(0, 4000),
      ) || "";

    const previewSections = [
      summary,
      responsibilities.length ? ["", "Key responsibilities:", ...responsibilities.map((item) => `- ${item}`)].join("\n") : "",
      skills.length ? ["", "Required skills:", ...skills.map((item) => `- ${item}`)].join("\n") : "",
    ].filter(Boolean);

    const previewText = previewSections.join("\n\n");
    const previewHtml = convertTextToPreviewHtml(previewText);
    const description = summary || stripHtml(previewHtml);

    const requirements = buildRequirements({
      existing: existingJob?.requirements ?? null,
      responsibilities,
      skills,
      source: parsed.data.source,
      uploadedDescriptionFile,
      summary,
      rawTextSample: clippedText.slice(0, 2000),
    });

    const job = existingJob
      ? await prisma.job.update({
          where: { id: existingJob.id },
          data: {
            title,
            description,
            previewHtml,
            requirements,
            seniority,
            tags: skills.length ? skills : undefined,
            employmentType,
            lastActivityAt: new Date(),
          },
          select: jobSelect,
        })
      : await prisma.job.create({
          data: {
            organizationId: context.organizationId,
            createdById: context.userId,
            title,
            description,
            previewHtml,
            requirements,
            seniority,
            tags: skills.length ? skills : undefined,
            employmentType,
            lastActivityAt: new Date(),
          },
          select: jobSelect,
        });

    return NextResponse.json({
      job,
      structured: {
        title,
        summary,
        responsibilities,
        skills,
        seniority: seniority ?? null,
        employmentType: employmentType ?? null,
      },
    });
  } catch (error) {
    console.error("[jobs/process-jd] Failed to process job description", error);
    const message = error instanceof Error ? error.message : "Unable to process job description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
