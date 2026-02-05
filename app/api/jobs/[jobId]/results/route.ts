import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { CvProcessingStatus } from "@prisma/client";
import prisma from "@/app/lib/prisma";

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
      title: true,
      requirements: true,
      createdAt: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const requiredSkills =
    job.requirements &&
    typeof job.requirements === "object" &&
    !Array.isArray(job.requirements) &&
    Array.isArray((job.requirements as Record<string, unknown>).skills)
      ? ((job.requirements as Record<string, unknown>).skills as unknown[])
          .map((item) => (typeof item === "string" ? item : String(item)))
          .filter(Boolean)
      : [];

  const shortlistTargetRaw =
    job.requirements &&
    typeof job.requirements === "object" &&
    !Array.isArray(job.requirements) &&
    (job.requirements as Record<string, unknown>).topCandidates;

  const shortlistTarget =
    typeof shortlistTargetRaw === "number"
      ? shortlistTargetRaw
      : typeof shortlistTargetRaw === "string"
        ? Number(shortlistTargetRaw)
        : null;

  const resumes = await prisma.resume.findMany({
    where: {
      jobId,
      organizationId: context.organizationId,
      status: CvProcessingStatus.COMPLETED,
      overallScore: { not: null },
    },
    select: {
      id: true,
      overallScore: true,
      scoreBreakdown: true,
      extractedFields: true,
      extractedText: true,
      candidate: {
        select: {
          id: true,
          fullName: true,
          currentCompany: true,
          currentTitle: true,
          yearsExperience: true,
        },
      },
    },
    orderBy: [{ overallScore: "desc" }, { updatedAt: "desc" }],
  });

  const shortlistSize = Math.max(
    1,
    Math.min(shortlistTarget ?? resumes.length, resumes.length || 1),
  );

  const candidates = resumes.map((resume) => {
    const candidate = resume.candidate;
    const name = candidate?.fullName || "Unknown candidate";
    const matchScoreRaw = Number(resume.overallScore ?? 0);
    const matchScore = Number.isFinite(matchScoreRaw)
      ? Math.round(matchScoreRaw <= 1 ? matchScoreRaw * 100 : matchScoreRaw)
      : 0;

    const parsedFields =
      resume.extractedFields && typeof resume.extractedFields === "object" ? resume.extractedFields : {};
    const matchedSkills = Array.isArray((parsedFields as Record<string, unknown>).skills)
      ? ((parsedFields as Record<string, unknown>).skills as unknown[])
          .map((item) => (typeof item === "string" ? item : String(item)))
          .filter(Boolean)
      : [];

    const summary =
      typeof (parsedFields as Record<string, unknown>).summary === "string"
        ? ((parsedFields as Record<string, unknown>).summary as string)
        : null;

    const experienceParts = [
      candidate?.yearsExperience ? `${candidate.yearsExperience} yrs` : null,
      candidate?.currentTitle || null,
      candidate?.currentCompany || null,
    ].filter(Boolean);

    const rankFromScore =
      resume.scoreBreakdown &&
      typeof resume.scoreBreakdown === "object" &&
      (resume.scoreBreakdown as Record<string, unknown>).rank
        ? Number((resume.scoreBreakdown as Record<string, unknown>).rank)
        : null;

    const rank = Number.isFinite(rankFromScore) ? (rankFromScore as number) : null;
    const stage = rank !== null && rank <= shortlistSize ? "shortlist" : "hold";

    return {
      id: resume.id,
      stage,
      name,
      matchScore,
      matchedSkills,
      experience: experienceParts.join(" | "),
      summary: summary ?? "No summary available yet.",
      skillGap: {
        required: requiredSkills,
        present: matchedSkills,
      },
      cvText: resume.extractedText ?? "",
      rank: rank ?? undefined,
    };
  });

  return NextResponse.json({
    jobId,
    requiredSkills,
    shortlistSize,
    candidates,
  });
}
