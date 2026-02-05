import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { EmploymentType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
type AuthToken = {
  id?: string;
  organizationId?: string;
};
const createJobSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().optional().or(z.literal("")),
    previewHtml: z.string().trim().optional().or(z.literal("")),
    previewText: z.string().trim().optional().or(z.literal("")),
    responsibilities: z.array(z.string().trim()).optional(),
    skills: z.array(z.string().trim()).optional(),
    experienceLevel: z.string().trim().optional().or(z.literal("")),
    companyCulture: z.string().trim().optional().or(z.literal("")),
    source: z.enum(["create", "upload"]).optional(),
    topCandidates: z.number().int().positive().max(500).optional(),
    driveLink: z.string().trim().url().optional().or(z.literal("")),
    uploadedDescriptionFile: z.string().trim().optional().or(z.literal("")),
    employmentType: z.string().trim().max(60).optional(),
    locations: z.array(z.string().trim()).optional(),
    openings: z.number().int().positive().max(500).optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    currency: z.string().trim().max(10).optional(),
    minEducation: z.string().trim().min(1, "Minimum education is required"),
    nationality: z.string().trim().min(1, "Nationality is required"),
    ageMin: z.number().int().nonnegative().optional(),
    ageMax: z.number().int().nonnegative().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.previewHtml?.trim() && !value.previewText?.trim() && !value.description?.trim()) {
      ctx.addIssue({ code: "custom", message: "Preview content is required", path: ["previewText"] });
    }
    if (value.ageMin !== undefined && value.ageMax !== undefined && value.ageMin > value.ageMax) {
      ctx.addIssue({ code: "custom", message: "Minimum age cannot exceed maximum age", path: ["ageMin"] });
    }
  });

const jobSelect: Prisma.JobSelect = {
  id: true,
  title: true,
  status: true,
  sortingState: true,
  cvSortedCount: true,
  cvAnalyzedCount: true,
  description: true,
  previewHtml: true,
  requirements: true,
  seniority: true,
  tags: true,
   employmentType: true,
   locations: true,
   openings: true,
   salaryMin: true,
   salaryMax: true,
   currency: true,
   minEducation: true,
   ageMin: true,
   ageMax: true,
   nationality: true,
  createdById: true,
  createdBy: { select: { id: true, name: true, email: true } },
  lastActivityAt: true,
  createdAt: true,
  updatedAt: true,
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

  return {
    userId,
    organizationId:
      tokenOrgId ??
      (
        await prisma.user.findUnique({
          where: { id: userId },
          select: { defaultOrgId: true },
        })
      )?.defaultOrgId ??
      null,
  };
}

function normalizeList(values?: string[]) {
  return values?.map((value) => value.trim()).filter(Boolean) ?? [];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+=(?:"[^"]*"|'[^']*')/gi, "");
}

// Convert plaintext preview into a simple HTML structure while escaping user input.
function convertTextToPreviewHtml(text: string) {
  const lines = text.split(/\r?\n/);
  const parts: string[] = [];
  let listOpen = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const isBullet = /^[-•]/.test(line);

    if (isBullet) {
      if (!listOpen) {
        parts.push("<ul>");
        listOpen = true;
      }
      const cleaned = line.replace(/^[-•]\s*/, "");
      parts.push(`<li>${escapeHtml(cleaned)}</li>`);
      continue;
    }

    if (listOpen) {
      parts.push("</ul>");
      listOpen = false;
    }

    if (!line.length) continue;
    parts.push(`<p>${escapeHtml(line)}</p>`);
  }

  if (listOpen) {
    parts.push("</ul>");
  }

  return `<div>${parts.join("")}</div>`;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function resolvePreviewHtml(payload: z.infer<typeof createJobSchema>) {
  if (payload.previewHtml?.trim()) {
    return sanitizeHtml(payload.previewHtml);
  }
  if (payload.previewText?.trim()) {
    return convertTextToPreviewHtml(payload.previewText);
  }
  if (payload.description?.trim()) {
    return convertTextToPreviewHtml(payload.description);
  }
  if (payload.uploadedDescriptionFile?.trim()) {
    const filename = escapeHtml(payload.uploadedDescriptionFile);
    const extras = payload.driveLink?.trim()
      ? `<p>Drive link: ${escapeHtml(payload.driveLink)}</p>`
      : "";
    return `<div><p>Uploaded description: ${filename}</p>${extras}</div>`;
  }
  return null;
}

function buildRequirements(payload: z.infer<typeof createJobSchema>): Prisma.InputJsonValue | undefined {
  const requirements: Record<string, unknown> = {};
  const responsibilities = normalizeList(payload.responsibilities);
  const skills = normalizeList(payload.skills);

  if (responsibilities.length) requirements.responsibilities = responsibilities;
  if (skills.length) requirements.skills = skills;
  if (payload.experienceLevel?.trim()) requirements.experienceLevel = payload.experienceLevel.trim();
  if (payload.companyCulture?.trim()) requirements.companyCulture = payload.companyCulture.trim();
  if (payload.source) requirements.source = payload.source;
  if (payload.topCandidates) requirements.topCandidates = payload.topCandidates;
  if (payload.driveLink?.trim()) requirements.driveLink = payload.driveLink.trim();
  if (payload.uploadedDescriptionFile?.trim()) requirements.uploadedDescriptionFile = payload.uploadedDescriptionFile;

  return Object.keys(requirements).length ? (requirements as Prisma.InputJsonValue) : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const context = await getSessionContext(request);
    if (!context.userId || !context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { updatedAt: "desc" },
      select: jobSelect,
    });

    return NextResponse.json({ jobs, viewerId: context.userId });
  } catch (error) {
    console.error("[jobs] Failed to load jobs", error);
    const message = error instanceof Error ? error.message : "Failed to load jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getSessionContext(request);
    if (!context.userId || !context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = createJobSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const jobId = parsed.data.id?.trim() || null;
    if (jobId) {
      const existingJob = await prisma.job.findFirst({
        where: { id: jobId, organizationId: context.organizationId },
        select: { id: true },
      });

      if (!existingJob) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
    }

    const previewHtml = resolvePreviewHtml(parsed.data);
    if (!previewHtml) {
      return NextResponse.json({ error: "Preview HTML is required" }, { status: 400 });
    }

    const requirements = buildRequirements(parsed.data);
    const skills = normalizeList(parsed.data.skills);
    const locations = normalizeList(parsed.data.locations);
    const openings = parsed.data.openings ?? 1;
    const salaryMin = parsed.data.salaryMin ?? null;
    const salaryMax = parsed.data.salaryMax ?? null;
    const employmentType =
      parsed.data.employmentType && Object.values(EmploymentType).includes(parsed.data.employmentType as EmploymentType)
        ? (parsed.data.employmentType as EmploymentType)
        : undefined;
    const minEducation = parsed.data.minEducation?.trim() || "Any";
    const nationality = parsed.data.nationality?.trim() || "Any";
    const ageMin = parsed.data.ageMin ?? null;
    const ageMax = parsed.data.ageMax ?? null;

    const data = {
      title: parsed.data.title.trim(),
      description:
        parsed.data.description?.trim() ||
        parsed.data.previewText?.trim() ||
        stripHtml(previewHtml) ||
        null,
      previewHtml,
      requirements,
      seniority: parsed.data.experienceLevel?.trim() || undefined,
      tags: skills.length ? skills : undefined,
      lastActivityAt: new Date(),
      employmentType,
      openings,
      locations: locations.length ? locations : undefined,
      salaryMin: salaryMin ?? undefined,
      salaryMax: salaryMax ?? undefined,
      currency: parsed.data.currency ?? "BDT",
      minEducation,
      nationality,
      ageMin: ageMin ?? undefined,
      ageMax: ageMax ?? undefined,
    };

    const job = jobId
      ? await prisma.job.update({
          where: { id: jobId },
          data,
          select: jobSelect,
        })
      : await prisma.job.create({
          data: {
            organizationId: context.organizationId,
            createdById: context.userId,
            ...data,
          },
          select: jobSelect,
        });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("[jobs] Failed to create job", error);
    const message = error instanceof Error ? error.message : "Failed to create job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
