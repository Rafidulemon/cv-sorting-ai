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
  try {
    const context = await getSessionContext(request);
    if (!context.userId || !context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") ?? 10)));
    const search = (searchParams.get("q") ?? "").trim();
    const source = (searchParams.get("source") ?? "").trim();
    const statusRaw = (searchParams.get("status") ?? "").trim();
    const status =
      statusRaw && Object.values(CvProcessingStatus).includes(statusRaw as CvProcessingStatus)
        ? (statusRaw as CvProcessingStatus)
        : null;

    const where = {
      organizationId: context.organizationId,
      ...(source
        ? {
            source: {
              equals: source,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(status
        ? {
            resumes: {
              some: {
                status,
              },
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
              { headline: { contains: search, mode: "insensitive" } },
              { tags: { hasSome: [search] } },
            ],
          }
        : {}),
    };

    const [candidates, total] = await prisma.$transaction([
      prisma.candidate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          location: true,
          headline: true,
          source: true,
          createdAt: true,
          tags: true,
          primaryResumeId: true,
          resumes: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              jobId: true,
              job: { select: { title: true } },
              status: true,
              file: { select: { key: true, id: true } },
              uploadedBy: { select: { name: true, email: true } },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.candidate.count({ where }),
    ]);

    const publicBase =
      process.env.S3_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ||
      null;

    const shaped = candidates.map((candidate) => {
      const resume = candidate.resumes?.[0];
      const publicUrl =
        publicBase && resume?.file?.key
          ? `${publicBase.replace(/\/+$/, "")}/${resume.file.key}`
          : null;
      return {
        id: candidate.id,
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        headline: candidate.headline,
        source: candidate.source,
        createdAt: candidate.createdAt,
        tags: candidate.tags,
        resumeId: resume?.id ?? candidate.primaryResumeId ?? null,
        jobId: resume?.jobId ?? null,
        jobTitle: resume?.job?.title ?? null,
        resumeKey: resume?.file?.key ?? null,
        resumePublicUrl: publicUrl,
        resumeStatus: resume?.status ?? null,
        uploadedBy: resume?.uploadedBy?.name || resume?.uploadedBy?.email || null,
      };
    });

    return NextResponse.json({ candidates: shaped, total, page, pageSize });
  } catch (error) {
    console.error("[candidates] Failed to load candidates", error);
    const message = error instanceof Error ? error.message : "Failed to load candidates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
