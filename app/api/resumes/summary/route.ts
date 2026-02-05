import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { CvProcessingStatus } from "@prisma/client";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

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

  if (!userId) return { userId: null, organizationId: null };

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

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export async function GET(request: NextRequest) {
  try {
    const { userId, organizationId } = await getSessionContext(request);
    if (!userId || !organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
    const firstMonth = startOfMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)));

    const [statusGroups, recentProcessed, monthlyResumes] = await Promise.all([
      prisma.resume.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: { organizationId },
      }),
      prisma.resume.findMany({
        where: {
          organizationId,
          processedAt: { gte: sevenDaysAgo },
          status: CvProcessingStatus.COMPLETED,
        },
        select: { processedAt: true },
      }),
      prisma.resume.findMany({
        where: {
          organizationId,
          createdAt: { gte: firstMonth },
        },
        select: {
          createdAt: true,
          processedAt: true,
          status: true,
        },
      }),
    ]);

    const statusCounts = Object.fromEntries(statusGroups.map((row) => [row.status, row._count._all]));

    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const day = startOfDay(new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000));
      dailyMap.set(day.toISOString().slice(0, 10), 0);
    }
    recentProcessed.forEach((resume) => {
      if (!resume.processedAt) return;
      const key = startOfDay(resume.processedAt).toISOString().slice(0, 10);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }
    });

    const dailyTimeSaved = Array.from(dailyMap.entries()).map(([date, completed]) => ({
      date,
      completed,
    }));

    const monthKeys: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + i, 1));
      monthKeys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
    }

    const monthlyBuckets = monthKeys.reduce<Record<string, { total: number; completed: number }>>((acc, key) => {
      acc[key] = { total: 0, completed: 0 };
      return acc;
    }, {});

    let totalSorted = 0;
    let totalDurationMs = 0;

    monthlyResumes.forEach((resume) => {
      const monthKey = `${resume.createdAt.getUTCFullYear()}-${String(resume.createdAt.getUTCMonth() + 1).padStart(2, "0")}`;
      if (monthlyBuckets[monthKey]) {
        monthlyBuckets[monthKey].total += 1;
        if (resume.status === CvProcessingStatus.COMPLETED) {
          monthlyBuckets[monthKey].completed += 1;
        }
      }

      if (resume.processedAt) {
        totalSorted += 1;
        totalDurationMs += Math.max(0, resume.processedAt.getTime() - resume.createdAt.getTime());
      }
    });

    const monthlySuccess = monthKeys.map((month) => {
      const bucket = monthlyBuckets[month];
      const successRate = bucket.total ? Math.round((bucket.completed / bucket.total) * 100) : 0;
      return { month, completed: bucket.completed, total: bucket.total, successRate };
    });

    const avgSortSeconds = totalSorted ? totalDurationMs / totalSorted / 1000 : null;

    return NextResponse.json({
      statusCounts,
      dailyTimeSaved,
      monthlySuccess,
      avgSortSeconds,
      totalSorted,
    });
  } catch (error) {
    console.error("[resumes/summary] Failed to load resume summary", error);
    const message = error instanceof Error ? error.message : "Failed to load resume summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
