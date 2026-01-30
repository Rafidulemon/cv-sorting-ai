import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createHash, webcrypto } from "crypto";
import { FileProvider, Prisma, CvProcessingStatus } from "@prisma/client";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthToken = {
  id?: string;
  organizationId?: string;
};

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

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
const crypto = webcrypto;
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB cap per CV
const encoder = new TextEncoder();

const allowedExtensions: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  txt: "text/plain",
};

function sanitizeFileName(raw: string) {
  const base = raw.split(/[/\\]/).pop() ?? raw;
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "-");
  return cleaned.length ? cleaned : "upload";
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

  const orgId =
    tokenOrgId ??
    (
      await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultOrgId: true },
      })
    )?.defaultOrgId ??
    null;

  return { userId, organizationId: orgId };
}

function resolveStorage(): StorageConfig | null {
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

async function sha256Hex(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string) {
  const rawKey: ArrayBuffer = key instanceof ArrayBuffer ? key : new Uint8Array(key).buffer;
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return new Uint8Array(signature);
}

async function getSignatureKey(secretKey: string, dateStamp: string, region: string, service: string) {
  const kDate = await hmacSha256(encoder.encode(`AWS4${secretKey}`), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

async function presignPutUrl(options: {
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
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSignatureKey(options.secretAccessKey, dateStamp, options.region, "s3");
  const signature = await hmacSha256(signingKey, stringToSign);
  const signatureHex = Array.from(signature)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `${endpoint}${canonicalUri}?${canonicalQuerystring}&X-Amz-Signature=${signatureHex}`;
}

async function uploadBufferToStorage(params: {
  buffer: Buffer;
  key: string;
  contentType: string;
  storage: StorageConfig;
}) {
  const uploadUrl = await presignPutUrl({
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

function deriveRequirements(
  current: Prisma.JsonValue | null,
  uploadedIds: string[],
  resumeIds: string[],
): Prisma.InputJsonValue {
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
  return { ...base, resumeFileIds: mergedFiles, resumeIds: mergedResumes } as Prisma.InputJsonValue;
}

function detectContentType(fileName: string) {
  const extension = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() ?? "" : "";
  return allowedExtensions[extension] ?? null;
}

function deriveCandidateName(fileName: string) {
  const base = fileName.includes(".") ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;
  const cleaned = base.replace(/[-_]+/g, " ").trim();
  return cleaned.length ? cleaned : "Unknown Candidate";
}

export async function POST(request: NextRequest) {
  try {
    const storage = resolveStorage();
    if (!storage) {
      return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
    }

    const contentTypeHeader = request.headers.get("content-type") || "";
    if (!contentTypeHeader.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Multipart form-data is required" }, { status: 400 });
    }

    const context = await getSessionContext(request);
    if (!context.userId || !context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orgId = context.organizationId as string;
    const uploaderId = context.userId as string;

    const form = await request.formData();
    const file = form.get("file");
    const jobId = (form.get("jobId") as string | null)?.trim() || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CV file is required" }, { status: 400 });
    }
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required to attach files" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "CV exceeds the 20MB limit" }, { status: 413 });
    }

    const owningJob = await prisma.job.findFirst({
      where: { id: jobId, organizationId: orgId },
      select: { id: true, requirements: true },
    });

    if (!owningJob) {
      return NextResponse.json({ error: "Job not found for this organization" }, { status: 404 });
    }

    const safeName = sanitizeFileName(file.name);
    const contentType = detectContentType(safeName);
    if (!contentType) {
      return NextResponse.json({ error: "Unsupported file type. Use PDF, DOC, DOCX, or TXT." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const objectKey = ["uploads", "job-candidates", orgId, jobId, `${Date.now()}-${safeName}`].join(
      "/",
    );

    await uploadBufferToStorage({
      buffer,
      key: objectKey,
      contentType,
      storage,
    });

    const checksum = createHash("sha256").update(buffer).digest("hex");
    const candidateName = deriveCandidateName(safeName);

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
          uploadedById: uploaderId,
          metadata: {
            originalName: safeName,
            source: "single-upload",
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
          jobId: owningJob.id,
          fileId: record.id,
          uploadedById: uploaderId,
          status: CvProcessingStatus.UPLOADED,
        },
        select: { id: true },
      });

      return { record, resume };
    });

    const nextRequirements = deriveRequirements(owningJob.requirements, [record.id], [resume.id]);

    await prisma.job.update({
      where: { id: owningJob.id },
      data: {
        requirements: nextRequirements,
        lastActivityAt: new Date(),
      },
    });

    const publicUrl =
      storage.publicBaseUrl && storage.publicBaseUrl.length
        ? `${storage.publicBaseUrl.replace(/\/+$/, "")}/${objectKey}`
        : null;

    return NextResponse.json({
      jobId: owningJob.id,
      file: {
        ...record,
        name: safeName,
        publicUrl,
      },
      resumeId: resume.id,
      requirementKey: "resumeFileIds",
    });
  } catch (error) {
    console.error("[jobs/upload-cv-file] Failed to upload CV", error);
    const message = error instanceof Error ? error.message : "Failed to upload CV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
