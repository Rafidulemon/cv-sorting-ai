import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { CvProcessingStatus, SortingState, JobStatus } from "@prisma/client";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { getSortingQueue, sortingJobOptions } from "@/app/lib/sortingQueue";

export const dynamic = "force-dynamic";

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

const bodySchema = z.object({
  topCandidates: z.number().int().positive().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
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
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = bodySchema.safeParse(body ?? {});
  if (!parsed.success && body) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const processedCount = await prisma.resume.count({
    where: {
      jobId,
      organizationId: context.organizationId,
      status: CvProcessingStatus.COMPLETED,
    },
  });

  if (!processedCount) {
    return NextResponse.json(
      { error: "No processed resumes available to sort" },
      { status: 400 },
    );
  }

  const topCandidates = parsed.success && parsed.data.topCandidates
    ? Math.min(parsed.data.topCandidates, processedCount)
    : processedCount;

  try {
    const queue = getSortingQueue();
    const bullJob = await queue.add(
      "cv-sort",
      {
        jobId,
        organizationId: context.organizationId,
        userId: context.userId,
        topCandidates,
      },
      {
        ...sortingJobOptions,
        jobId: `${jobId}-${Date.now()}`,
      },
    );

    await prisma.job.update({
      where: { id: jobId },
      data: {
        sortingState: SortingState.PROCESSING,
        status: JobStatus.SORTING,
        cvSortedCount: 0,
        lastActivityAt: new Date(),
      },
    });

    return NextResponse.json({
      queueJobId: bullJob.id,
      sortingState: SortingState.PROCESSING,
      total: processedCount,
      topCandidates,
    });
  } catch (error) {
    const message = (error as Error)?.message ?? "Failed to enqueue sorting job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const context = await getSessionContext(request);
  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await prisma.job.findFirst({
    where: { id: jobId, organizationId: context.organizationId },
    select: {
      id: true,
      sortingState: true,
      cvSortedCount: true,
      cvAnalyzedCount: true,
      lastActivityAt: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const queueJobId = searchParams.get("queueJobId");

  let queueStatus: string | null = null;
  if (queueJobId) {
    try {
      const queue = getSortingQueue();
      const bullJob = await queue.getJob(queueJobId);
      if (bullJob) {
        queueStatus = await bullJob.getState();
      }
    } catch (error) {
      console.warn("Failed to fetch BullMQ status", error);
    }
  }

  return NextResponse.json({
    sortingState: job.sortingState,
    cvSortedCount: job.cvSortedCount,
    cvAnalyzedCount: job.cvAnalyzedCount,
    lastActivityAt: job.lastActivityAt,
    queueStatus,
  });
}
