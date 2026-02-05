import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { CvProcessingStatus } from "@prisma/client";
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

  const grouped = await prisma.resume.groupBy({
    by: ["status"],
    _count: { _all: true },
    where: { jobId, organizationId: context.organizationId },
  });

  const counts = Object.fromEntries(grouped.map((row) => [row.status, row._count._all]));
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);
  const completed = counts[CvProcessingStatus.COMPLETED] ?? 0;
  const failed = counts[CvProcessingStatus.FAILED] ?? 0;
  const inProgress =
    (counts[CvProcessingStatus.PARSING] ?? 0) +
    (counts[CvProcessingStatus.EMBEDDING] ?? 0) +
    (counts[CvProcessingStatus.SCORING] ?? 0);
  const pending = Math.max(0, total - completed);

  return NextResponse.json({
    total,
    completed,
    failed,
    inProgress,
    pending,
    counts,
  });
}
