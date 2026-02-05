import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { CvProcessingStatus, QueueName, QueueStatus } from "@prisma/client";
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

export async function POST(
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
    select: { id: true, organizationId: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const resumesToProcess = await prisma.resume.findMany({
    where: {
      jobId,
      organizationId: context.organizationId,
      status: { in: [CvProcessingStatus.UPLOADED, CvProcessingStatus.FAILED] },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!resumesToProcess.length) {
    return NextResponse.json({ error: "No unprocessed resumes found" }, { status: 400 });
  }

  const queueJobs = await prisma.$transaction((tx) => {
    const creations = resumesToProcess.map((resume) =>
      tx.queueJob.create({
        data: {
          organizationId: context.organizationId!,
          userId: context.userId!,
          jobId,
          candidateId: null,
          queue: QueueName.CV_PIPELINE,
          status: QueueStatus.QUEUED,
          payload: {
            kind: "resume-processing",
            resumeId: resume.id,
          },
        },
        select: { id: true },
      }),
    );

    const resumeIds = resumesToProcess.map((resume) => resume.id);
    const resumeUpdates = tx.resume.updateMany({
      where: { id: { in: resumeIds } },
      data: { status: CvProcessingStatus.PARSING, errorMessage: null, ocrStartedAt: null },
    });

    return Promise.all([Promise.all(creations), resumeUpdates]).then(([jobs]) => jobs);
  });

  return NextResponse.json({
    queued: queueJobs.length,
    queueJobIds: queueJobs.map((job) => job.id),
    resumeIds: resumesToProcess.map((resume) => resume.id),
  });
}
