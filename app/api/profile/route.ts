import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

type ProfileRouteContext = { params: Promise<Record<string, never>> };

const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  phone: true,
  designation: true,
  team: true,
  timezone: true,
  profileStatus: true,
  startedAt: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Parameters<typeof prisma.user.findUnique>[0]["select"];

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(140),
  designation: z.string().trim().max(140).optional().or(z.literal("")),
  team: z.string().trim().max(140).optional().or(z.literal("")),
  phone: z.string().trim().max(80).optional().or(z.literal("")),
  timezone: z.string().trim().max(120).optional().or(z.literal("")),
  image: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value?.length) return true;
        if (value.startsWith("http") || value.startsWith("/") || value.startsWith("data:")) return true;
        // Allow storage keys like uploads/profile-picture/... or uploads/company-logos/...
        if (/^uploads\//.test(value)) return true;
        return false;
      },
      { message: "Image must be a URL, data URI, or storage key" }
    ),
});

function normalizeStorageKey(value?: string | null) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  if (!trimmed.length) return null;

  const publicBase = (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  if (publicBase && trimmed.startsWith(publicBase)) {
    return trimmed.slice(publicBase.length).replace(/^\/+/, "");
  }

  try {
    const url = new URL(trimmed);
    return url.pathname.replace(/^\/+/, "") || trimmed;
  } catch {
    return trimmed.replace(/^\/+/, "");
  }
}

function buildPublicUrlFromKey(key?: string | null) {
  const trimmed = key?.trim();
  if (!trimmed?.length) return null;
  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  const publicBase = (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  return publicBase ? `${publicBase}/${trimmed}` : trimmed;
}

function toNullable(value?: string | null) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

const getHandler = auth(async (request) => {
  try {
    const userId = (request.auth?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
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

    const membership = {
      lastActiveAt: user?.lastLoginAt ?? null,
      createdAt: user?.createdAt ?? null,
    };

    const totalSorted = jobs.reduce((sum, job) => sum + (job.cvSortedCount ?? 0), 0);
    const totalAnalyzed = jobs.reduce((sum, job) => sum + (job.cvAnalyzedCount ?? 0), 0);
    const liveJobs = jobs.filter((job) => job.status === "ACTIVE").length;

    const imageUrl = buildPublicUrlFromKey(user?.image);

    return NextResponse.json({
      user,
      imageUrl,
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

const updateHandler = auth(async (request) => {
  try {
    const userId = (request.auth?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = profileUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const imageKey = normalizeStorageKey(data.image);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name.trim(),
        designation: toNullable(data.designation),
        team: toNullable(data.team),
        phone: toNullable(data.phone),
        timezone: toNullable(data.timezone),
        image: toNullable(imageKey),
      },
      select: profileSelect,
    });

    return NextResponse.json({ user, imageUrl: buildPublicUrlFromKey(user.image) });
  } catch (error) {
    console.error("Profile update failed", error);
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export async function GET(request: NextRequest, context: ProfileRouteContext) {
  const params = await context.params;
  return getHandler(request, { params });
}

export async function PUT(request: NextRequest, context: ProfileRouteContext) {
  const params = await context.params;
  return updateHandler(request, { params });
}
