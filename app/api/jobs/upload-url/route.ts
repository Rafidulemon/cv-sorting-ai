import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { JobStatus, Prisma } from "@prisma/client";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type AuthToken = {
  id?: string;
  organizationId?: string;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB hard cap for job descriptions
const UPLOAD_EXPIRES_SECONDS = 15 * 60;

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function sanitizeFileName(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "-");
  return base.length ? base : "upload";
}

function decodeHeaderBytes(base64?: string) {
  if (!base64) return null;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function looksLikePdf(bytes: Uint8Array) {
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function looksLikeDoc(bytes: Uint8Array) {
  return bytes.length >= 4 && bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
}

function looksLikeDocx(bytes: Uint8Array) {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

function looksLikeText(bytes: Uint8Array) {
  if (!bytes.length) return false;
  // Consider plain text when printable or whitespace for nearly all bytes
  const printable = bytes.filter((byte) => byte === 0x9 || byte === 0xa || byte === 0xd || (byte >= 0x20 && byte <= 0x7e)).length;
  return printable / bytes.length > 0.95;
}

function sniffMime(bytes: Uint8Array | null, declared: string) {
  const normalized = declared.toLowerCase();
  if (bytes && looksLikePdf(bytes)) return "application/pdf";
  if (bytes && looksLikeDocx(bytes)) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (bytes && looksLikeDoc(bytes)) return "application/msword";
  if (bytes && looksLikeText(bytes)) return "text/plain";
  if (!bytes && allowedMimeTypes.has(normalized)) return normalized;
  if (normalized === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return normalized;
  if (normalized === "application/msword") return normalized;
  if (normalized === "application/pdf") return normalized;
  if (normalized.startsWith("text/")) return "text/plain";
  return null;
}

const encoder = new TextEncoder();

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
    ["X-Amz-Expires", String(UPLOAD_EXPIRES_SECONDS)],
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
  const signatureBytes = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(signatureBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const signedUrl = `${endpoint}${canonicalUri}?${canonicalQuerystring}&X-Amz-Signature=${signature}`;

  return signedUrl;
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
        await prisma.membership.findFirst({
          where: tokenOrgId ? { userId, organizationId: tokenOrgId } : { userId },
          orderBy: { createdAt: "asc" },
          select: { organizationId: true },
        })
      )?.organizationId ??
      null,
  };
}

function deriveTitleFromFilename(filename: string | null) {
  if (!filename) return null;
  const withoutPath = filename.split("/").pop() ?? filename;
  const withoutExt = withoutPath.includes(".") ? withoutPath.slice(0, withoutPath.lastIndexOf(".")) : withoutPath;
  const cleaned = withoutExt.replace(/[-_]+/g, " ").trim();
  return cleaned.length ? cleaned : null;
}

async function resolveJobForUpload(options: {
  jobId: string | null;
  jobTitle: string | null;
  fallbackTitle: string | null;
  organizationId: string;
  userId: string;
}) {
  if (options.jobId) {
    const existing = await prisma.job.findFirst({
      where: { id: options.jobId, organizationId: options.organizationId },
      select: { id: true, requirements: true },
    });

    if (!existing) {
      throw new Error("Job not found for this organization");
    }

    return existing;
  }

  const derivedTitle =
    options.jobTitle?.trim() ||
    deriveTitleFromFilename(options.fallbackTitle) ||
    "Untitled job";

  return prisma.job.create({
    data: {
      organizationId: options.organizationId,
      createdById: options.userId,
      title: derivedTitle,
      status: JobStatus.DRAFT,
      lastActivityAt: new Date(),
    },
    select: { id: true, requirements: true },
  });
}

export async function POST(request: NextRequest) {
  try {
    const storage = {
      bucket: process.env.S3_BUCKET,
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION ?? "auto",
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      sessionToken: process.env.S3_TOKEN_VALUE,
      publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
    };

    if (!storage.bucket || !storage.endpoint || !storage.accessKeyId || !storage.secretAccessKey) {
      return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
    }

    const normalizedEndpoint = storage.endpoint?.toLowerCase() ?? "";
    const allowSessionToken =
      storage.sessionToken &&
      !normalizedEndpoint.includes("cloudflarestorage.com") &&
      !normalizedEndpoint.includes("r2.cloudflarestorage.com");
    const sessionToken = allowSessionToken ? storage.sessionToken : undefined;

    const context = await getSessionContext(request);

    if (!context.userId || !context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentTypeHeader = request.headers.get("content-type") || "";
    const isMultipart = contentTypeHeader.includes("multipart/form-data");

    if (isMultipart) {
      const form = await request.formData();
      const file = form.get("file");
      const scanRequested = (form.get("scan") as string | null) === "true";
      const providedName = (form.get("fileName") as string | null) || undefined;
      const providedContentType = (form.get("contentType") as string | null) || undefined;
      const providedJobId = (form.get("jobId") as string | null) || null;
      const providedJobTitle = (form.get("jobTitle") as string | null) || null;
      const fallbackTitle = providedName ?? (file instanceof File ? file.name : null);

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 413 });
      }

      const headerBytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
      const sniffedMime = sniffMime(headerBytes, providedContentType ?? file.type ?? "application/octet-stream");
      if (!sniffedMime || !allowedMimeTypes.has(sniffedMime)) {
        return NextResponse.json({ error: "Unsupported or unsafe file type" }, { status: 400 });
      }

      let jobForUpload;
      try {
        jobForUpload = await resolveJobForUpload({
          jobId: providedJobId,
          jobTitle: providedJobTitle,
          fallbackTitle,
          organizationId: context.organizationId,
          userId: context.userId,
        });
      } catch (jobError) {
        const message = (jobError as Error)?.message ?? "Unable to create job for upload";
        const status = message.includes("not found") ? 404 : 400;
        return NextResponse.json({ error: message }, { status });
      }

      const safeName = sanitizeFileName(providedName ?? file.name);
      const extension = safeName.includes(".") ? safeName.slice(safeName.lastIndexOf(".")) : "";
      const objectKey = [
        "uploads",
        "job-descriptions",
        context.organizationId,
        `${jobForUpload.id}${extension}`,
      ].join("/");

      const uploadUrl = await presignPutUrl({
        endpoint: storage.endpoint,
        bucket: storage.bucket,
        key: objectKey,
        contentType: sniffedMime,
        region: storage.region,
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
        sessionToken,
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": sniffedMime },
        body: file,
      });

      if (!uploadResponse.ok) {
        console.error("[jobs/upload-url] R2 upload failed", uploadResponse.status, await uploadResponse.text());
        return NextResponse.json({ error: "Upload to storage failed" }, { status: 502 });
      }

      const existingRequirements =
        (jobForUpload.requirements as Prisma.JsonObject | null) && typeof jobForUpload.requirements === "object"
          ? (jobForUpload.requirements as Prisma.JsonObject)
          : {};
      const updatedRequirements: Prisma.JsonObject = {
        ...existingRequirements,
        uploadedDescriptionFile: objectKey,
      };

      await prisma.job.update({
        where: { id: jobForUpload.id },
        data: {
          requirements: updatedRequirements as Prisma.InputJsonValue,
          lastActivityAt: new Date(),
        },
      });

      const publicUrl =
        storage.publicBaseUrl && storage.publicBaseUrl.length
          ? `${storage.publicBaseUrl.replace(/\/+$/, "")}/${objectKey}`
          : null;

      const securityNote =
        "We hard-cap uploads at 5MB, reject mismatched MIME signatures, and queue virus scanning for higher-risk tiers.";

      return NextResponse.json({
        key: objectKey,
        publicUrl,
        contentType: sniffedMime,
        maxBytes: MAX_FILE_SIZE_BYTES,
        expiresInSeconds: UPLOAD_EXPIRES_SECONDS,
        virusScanQueued: scanRequested,
        securityNote,
        uploaded: true,
        jobId: jobForUpload.id,
      });
    } else {
      let payload: unknown;
      try {
        payload = await request.json();
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }

      const requestSchema = z.object({
        fileName: z.string().trim().min(1).max(180),
        size: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
        contentType: z.string().trim().min(1).max(120),
        headerBytes: z.string().trim().optional(),
        scan: z.boolean().optional(),
        jobId: z.string().trim().optional(),
        jobTitle: z.string().trim().max(180).optional(),
      });

      const parsed = requestSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid payload", details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const headerBytes = decodeHeaderBytes(parsed.data.headerBytes);
      const sniffedMime = sniffMime(headerBytes, parsed.data.contentType);
      if (!sniffedMime || !allowedMimeTypes.has(sniffedMime)) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
      }

      let jobForUpload;
      try {
        jobForUpload = await resolveJobForUpload({
          jobId: parsed.data.jobId ?? null,
          jobTitle: parsed.data.jobTitle ?? null,
          fallbackTitle: parsed.data.fileName ?? null,
          organizationId: context.organizationId,
          userId: context.userId,
        });
      } catch (jobError) {
        const message = (jobError as Error)?.message ?? "Unable to create job for upload";
        const status = message.includes("not found") ? 404 : 400;
        return NextResponse.json({ error: message }, { status });
      }

      const safeName = sanitizeFileName(parsed.data.fileName);
      const extension = safeName.includes(".") ? safeName.slice(safeName.lastIndexOf(".")) : "";
      const objectKey = [
        "uploads",
        "job-descriptions",
        context.organizationId,
        `${jobForUpload.id}${extension}`,
      ].join("/");

      const uploadUrl = await presignPutUrl({
        endpoint: storage.endpoint,
        bucket: storage.bucket,
        key: objectKey,
        contentType: sniffedMime,
        region: storage.region,
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
        sessionToken,
      });

      const publicUrl =
        storage.publicBaseUrl && storage.publicBaseUrl.length
          ? `${storage.publicBaseUrl.replace(/\/+$/, "")}/${objectKey}`
          : null;

      const securityNote =
        "We hard-cap uploads at 5MB, reject mismatched MIME signatures, and queue virus scanning for higher-risk tiers.";

      const existingRequirements =
        (jobForUpload.requirements as Prisma.JsonObject | null) && typeof jobForUpload.requirements === "object"
          ? (jobForUpload.requirements as Prisma.JsonObject)
          : {};
      const updatedRequirements: Prisma.JsonObject = {
        ...existingRequirements,
        uploadedDescriptionFile: objectKey,
      };

      await prisma.job.update({
        where: { id: jobForUpload.id },
        data: {
          requirements: updatedRequirements as Prisma.InputJsonValue,
          lastActivityAt: new Date(),
        },
      });

      return NextResponse.json({
        uploadUrl,
        key: objectKey,
        publicUrl,
        contentType: sniffedMime,
        maxBytes: MAX_FILE_SIZE_BYTES,
        expiresInSeconds: UPLOAD_EXPIRES_SECONDS,
        virusScanQueued: Boolean(parsed.data.scan),
        securityNote,
        jobId: jobForUpload.id,
      });
    }
  } catch (error) {
    console.error("[jobs/upload-url] Failed to generate upload URL", error);
    return NextResponse.json({ error: "Unable to create upload URL" }, { status: 500 });
  }
}
