import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

type AuthToken = { id?: string; organizationId?: string };

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

type StorageConfig = {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

function resolveStorage(): StorageConfig | null {
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "auto";
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const sessionToken = process.env.S3_TOKEN_VALUE;
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) return null;
  return { bucket, endpoint, region, accessKeyId, secretAccessKey, sessionToken };
}

async function presignDeleteUrl(options: StorageConfig & { key: string }) {
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

  const canonicalQuerystring = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${options.accessKeyId}/${credentialScope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", "600"],
    ["X-Amz-SignedHeaders", signedHeaders],
  ]
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const canonicalHeaders = `host:${host}\n`;
  const payloadHash = "UNSIGNED-PAYLOAD";
  const canonicalRequest = ["DELETE", canonicalUri, canonicalQuerystring, canonicalHeaders, signedHeaders, payloadHash].join(
    "\n",
  );

  const encoder = new TextEncoder();
  const crypto = globalThis.crypto;
  const sha256Hex = async (value: string) => {
    const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const hmacSha256 = async (key: ArrayBuffer | Uint8Array, data: string) => {
    const rawKey: ArrayBuffer = key instanceof ArrayBuffer ? key : new Uint8Array(key).buffer;
    const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
    return new Uint8Array(signature);
  };

  const getSignatureKey = async (secretKey: string, dateStamp: string, region: string, service: string) => {
    const kDate = await hmacSha256(encoder.encode(`AWS4${secretKey}`), dateStamp);
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    return hmacSha256(kService, "aws4_request");
  };

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

async function deleteFromStorage(key: string | null | undefined) {
  if (!key) return;
  const storage = resolveStorage();
  if (!storage) return;
  try {
    const url = await presignDeleteUrl({ ...storage, key });
    await fetch(url, { method: "DELETE" });
  } catch (error) {
    console.warn("[candidates] Failed to delete object", error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const context = await getSessionContext(request);
  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidate = await prisma.candidate.findFirst({
    where: { id, organizationId: context.organizationId },
    select: {
      id: true,
      primaryResumeId: true,
      resumes: {
        select: {
          id: true,
          file: { select: { id: true, key: true } },
        },
      },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const resumeIds = candidate.resumes.map((r) => r.id);
  const fileIds = candidate.resumes.map((r) => r.file?.id).filter(Boolean) as string[];
  const fileKeys = candidate.resumes.map((r) => r.file?.key).filter(Boolean) as string[];

  await prisma.$transaction(async (tx) => {
    if (fileIds.length) {
      await tx.fileObject.deleteMany({ where: { id: { in: fileIds }, organizationId: context.organizationId! } });
    }
    if (resumeIds.length) {
      await tx.resumeEmbedding.deleteMany({ where: { resumeId: { in: resumeIds } } });
      await tx.resume.deleteMany({ where: { id: { in: resumeIds }, organizationId: context.organizationId! } });
    }
    await tx.candidate.delete({ where: { id: candidate.id } });
  });

  await Promise.all(fileKeys.map((key) => deleteFromStorage(key)));

  return NextResponse.json({ deleted: true });
}
