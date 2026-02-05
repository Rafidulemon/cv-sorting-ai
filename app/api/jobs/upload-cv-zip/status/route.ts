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

export async function GET(request: NextRequest) {
  const queueJobId = request.nextUrl.searchParams.get("queueJobId");
  if (!queueJobId) {
    return NextResponse.json({ error: "queueJobId is required" }, { status: 400 });
  }

  const context = await getSessionContext(request);
  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const queueJob = await prisma.queueJob.findUnique({
    where: { id: queueJobId },
    select: {
      id: true,
      queue: true,
      status: true,
      payload: true,
      result: true,
      error: true,
      createdAt: true,
      startedAt: true,
      completedAt: true,
      failedAt: true,
      organizationId: true,
      jobId: true,
    },
  });

  if (!queueJob || queueJob.organizationId !== context.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: queueJob.id,
    queue: queueJob.queue,
    status: queueJob.status,
    payload: queueJob.payload,
    result: queueJob.result,
    error: queueJob.error,
    createdAt: queueJob.createdAt,
    startedAt: queueJob.startedAt,
    completedAt: queueJob.completedAt,
    failedAt: queueJob.failedAt,
    jobId: queueJob.jobId,
  });
}
