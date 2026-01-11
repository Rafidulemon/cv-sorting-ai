import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";

type ProfileRouteContext = { params: Promise<{}> };

const handler = auth(async (request) => {
  try {
    const userId = (request.auth?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        title: true,
        team: true,
        timezone: true,
        profileStatus: true,
        startedAt: true,
      },
    });

    const jobs = await prisma.job.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        status: true,
        cvSortedCount: true,
        cvAnalyzedCount: true,
        lastActivityAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const membership = await prisma.membership.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { lastActiveAt: true, createdAt: true },
    });

    const totalSorted = jobs.reduce((sum, job) => sum + (job.cvSortedCount ?? 0), 0);
    const totalAnalyzed = jobs.reduce((sum, job) => sum + (job.cvAnalyzedCount ?? 0), 0);
    const liveJobs = jobs.filter((job) => job.status === "ACTIVE").length;

    return NextResponse.json({
      user,
      stats: {
        jobsCreated: jobs.length,
        liveJobs,
        totalSorted,
        totalAnalyzed,
      },
      jobs,
      membership,
    });
  } catch (error) {
    console.error("Profile fetch failed", error);
    const message = error instanceof Error ? error.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export async function GET(request: NextRequest, context: ProfileRouteContext) {
  const params = await context.params;
  return handler(request, { params });
}
