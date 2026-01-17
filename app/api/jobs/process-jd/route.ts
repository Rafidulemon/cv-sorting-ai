import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { EmploymentType, Prisma } from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";
import { PDFParse } from "pdf-parse";
import JSZip from "jszip";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
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
const SUPPORTED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const SUPPORTED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const pdfWorkerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
PDFParse.setWorker(pdfWorkerSrc);

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
  createdById: true,
  createdBy: { select: { id: true, name: true, email: true } },
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

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function extractTextFromPdf(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy();
  return parsed.text ?? "";
}

async function extractTextFromDocx(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) {
    throw new Error("DOCX is missing document content.");
  }
  const xml = await documentFile.async("text");
  const matches = Array.from(xml.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)).map((match) =>
    decodeXmlEntities(match[1] ?? "").trim(),
  );
  return matches.join(" ").trim();
}

function extractTextFromTxt(buffer: Buffer) {
  return buffer.toString("utf-8");
}

function detectFileKind(file: File): "pdf" | "docx" | "txt" | null {
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "" : "";
  const mime = (file.type || "").toLowerCase();

  if (SUPPORTED_EXTENSIONS.has(extension)) {
    return extension === "txt" ? "txt" : (extension as "pdf" | "docx");
  }

  if (SUPPORTED_FILE_TYPES.has(mime)) {
    if (mime === "application/pdf") return "pdf";
    if (mime === "text/plain") return "txt";
    return "docx";
  }

  return null;
}

async function extractTextFromFile(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Job description must be 5MB or smaller.");
  }

  const kind = detectFileKind(file);
  if (!kind) {
    throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (kind === "pdf") return extractTextFromPdf(buffer);
  if (kind === "docx") return extractTextFromDocx(buffer);
  return extractTextFromTxt(buffer);
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

  return {
    userId,
    organizationId:
      tokenOrgId ??
      (
        await prisma.user.findUnique({
          where: { id: userId },
          select: { defaultOrgId: true },
        })
      )?.defaultOrgId ??
      null,
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
  category?: string;
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
          "Extract structured fields from the job description. Respond ONLY with JSON matching the schema: {\"title\": string, \"summary\": string, \"description\": string, \"responsibilities\": string[], \"skills\": string[], \"seniority\": string, \"employmentType\": string, \"category\": string}. Keep strings concise and plain text.",
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
  category?: string | null;
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
  if (options.category?.trim()) {
    base.category = options.category.trim();
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

    const contentType = request.headers.get("content-type") ?? "";
    let text: string | null = null;
    let source: "upload" | "paste" = "upload";
    let jobId: string | null = null;
    let fileName: string | null = null;
    let uploadedDescriptionFile: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "A PDF, DOCX, or TXT file is required." }, { status: 400 });
      }

      const extracted = stripNullCharacters((await extractTextFromFile(file)).trim());
      if (extracted.length < 30) {
        return NextResponse.json(
          { error: "Job description text is too short to process." },
          { status: 400 },
        );
      }

      text = extracted.slice(0, 12000);
      const jobIdValue = formData.get("jobId");
      jobId = typeof jobIdValue === "string" && jobIdValue.trim().length ? jobIdValue.trim() : null;
      const fileNameValue = formData.get("fileName");
      fileName =
        typeof fileNameValue === "string"
          ? stripNullCharacters(fileNameValue)
          : stripNullCharacters(file.name);
      const uploadedFileValue = formData.get("uploadedDescriptionFile");
      uploadedDescriptionFile =
        typeof uploadedFileValue === "string"
          ? stripNullCharacters(uploadedFileValue)
          : stripNullCharacters(file.name);
      const sourceValue = formData.get("source");
      source = sourceValue === "paste" ? "paste" : "upload";
    } else {
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
      const trimmed = sanitizedText.trim();
      text = trimmed.slice(0, 12000);
      jobId = parsed.data.jobId?.trim() || null;
      fileName = parsed.data.fileName ? stripNullCharacters(parsed.data.fileName) : parsed.data.fileName ?? null;
      uploadedDescriptionFile = parsed.data.uploadedDescriptionFile
        ? stripNullCharacters(parsed.data.uploadedDescriptionFile)
        : parsed.data.uploadedDescriptionFile ?? null;
      source = parsed.data.source;
    }

    if (!text || !text.trim().length) {
      return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
    }

    const clippedText = text.trim();
    const safeFileName = fileName;

    const existingJob = jobId
      ? await prisma.job.findFirst({
          where: { id: jobId, organizationId: context.organizationId },
          select: { id: true, requirements: true },
        })
      : null;

    if (jobId && !existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { structured } = await parseWithOpenAi(clippedText);
    const responsibilities = normalizeList(structured.responsibilities);
    const skills = normalizeList(structured.skills);
    const employmentType = coerceEmploymentType(
      stripNullCharacters(structured.employmentType ?? "").trim() || undefined,
    );
    const seniority = stripNullCharacters(structured.seniority ?? "").trim() || undefined;
    const category = stripNullCharacters(structured.category ?? "").trim() || undefined;
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
      source,
      uploadedDescriptionFile,
      summary,
      rawTextSample: clippedText.slice(0, 2000),
      category: category ?? null,
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
        category: category ?? null,
      },
    });
  } catch (error) {
    console.error("[jobs/process-jd] Failed to process job description", error);
    const message = error instanceof Error ? error.message : "Unable to process job description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
