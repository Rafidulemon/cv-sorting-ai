import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

type AuthToken = {
  id?: string;
  organizationId?: string;
};

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const context = await getSessionContext(request);
  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, organizationId: context.organizationId },
    select: { id: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const resumes = await prisma.resume.findMany({
    where: { jobId, organizationId: context.organizationId },
    select: {
      id: true,
      status: true,
      file: {
        select: {
          id: true,
          key: true,
          mimeType: true,
          size: true,
          metadata: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const publicBase =
    process.env.S3_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ||
    null;

  const files = resumes
    .map((resume) => {
      const nameFromMeta =
        resume.file?.metadata &&
        typeof resume.file.metadata === "object" &&
        !Array.isArray(resume.file.metadata) &&
        (resume.file.metadata as Record<string, unknown>).originalName;

      const name =
        typeof nameFromMeta === "string"
          ? nameFromMeta
          : resume.file?.key?.split("/").pop() ?? "Resume";

      const publicUrl =
        publicBase && resume.file?.key
          ? `${publicBase.replace(/\/+$/, "")}/${resume.file.key}`
          : null;

      return {
        resumeId: resume.id,
        fileId: resume.file?.id ?? null,
        key: resume.file?.key ?? null,
        publicUrl,
        name,
        status: resume.status,
        mimeType: resume.file?.mimeType ?? null,
        size: resume.file?.size ?? null,
      };
    })
    .filter((item) => item.fileId);

  return NextResponse.json({ files });
}
