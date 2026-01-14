import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(140),
  companyEmail: z.string().trim().email("A valid company email is required").max(180),
  website: z.string().trim().url().max(200).optional().or(z.literal("")),
  logo: z.string().trim().max(500).optional().or(z.literal("")),
  domain: z.string().trim().max(140).optional().or(z.literal("")),
  industry: z.string().trim().max(140).optional().or(z.literal("")),
  size: z.string().trim().max(120).optional().or(z.literal("")),
  region: z.string().trim().max(140).optional().or(z.literal("")),
  hqLocation: z.string().trim().max(160).optional().or(z.literal("")),
  billingEmail: z.string().trim().email().max(160),
  phone: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

const orgSelectAdmin = {
  id: true,
  name: true,
  slug: true,
  website: true,
  logo: true,
  domain: true,
  industry: true,
  size: true,
  region: true,
  hqLocation: true,
  billingEmail: true,
  phone: true,
  description: true,
  companyEmail: true,
  planTier: true,
  planSlug: true,
  seatLimit: true,
  creditsBalance: true,
  updatedAt: true,
  plan: {
    select: {
      slug: true,
      name: true,
      team: true,
    },
  },
} satisfies Parameters<typeof prisma.organization.findUnique>[0]["select"];

const orgSelectMember = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  companyEmail: true,
  planTier: true,
  planSlug: true,
  plan: {
    select: {
      slug: true,
      name: true,
      team: true,
    },
  },
} satisfies Parameters<typeof prisma.organization.findUnique>[0]["select"];

function toNullable(value?: string | null) {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

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

async function getSessionContext(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  const userId = (token as any)?.id as string | undefined;
  const tokenOrgId = (token as any)?.organizationId as string | undefined;

  if (!userId) {
    return { userId: null, organizationId: null, role: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultOrgId: true, role: true },
  });

  return {
    userId,
    organizationId: tokenOrgId ?? user?.defaultOrgId ?? null,
    role: user?.role ?? ((token as any)?.role as string | undefined) ?? null,
  };
}

export async function GET(request: NextRequest) {
  const context = await getSessionContext(request);

  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: context.organizationId },
    select: { ...orgSelectAdmin, ownerId: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const isAdmin =
    context.role === "COMPANY_ADMIN" ||
    context.role === "SUPER_ADMIN" ||
    organization.ownerId === context.userId;

  const orgSelect = isAdmin ? organization : null;
  const organizationResponse = {
    ...(isAdmin
      ? organization
      : ({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          planTier: organization.planTier,
          planSlug: organization.planSlug,
          plan: organization.plan,
        } as typeof organization)),
    logo: organization.logo ?? null,
    logoKey: organization.logo ?? null,
    logoUrl: buildPublicUrlFromKey(organization.logo),
  };

  return NextResponse.json({ organization: organizationResponse, membershipRole: context.role });
}

export async function PUT(request: NextRequest) {
  const context = await getSessionContext(request);

  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: context.organizationId },
    select: { id: true, ownerId: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const isAdmin =
    context.role === "COMPANY_ADMIN" ||
    context.role === "SUPER_ADMIN" ||
    organization.ownerId === context.userId;

  if (!isAdmin) {
    return NextResponse.json({ error: "Only company admins can update settings" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = companySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const normalizedName = data.name.trim();
  const normalizedCompanyEmail = data.companyEmail.trim().toLowerCase();

  const duplicateName = await prisma.organization.findFirst({
    where: {
      id: { not: organization.id },
      name: { equals: normalizedName, mode: "insensitive" },
    },
    select: { id: true },
  });

  if (duplicateName) {
    return NextResponse.json({ error: "Another company already uses this name. Please choose a different name." }, { status: 409 });
  }

  const duplicateEmail = await prisma.organization.findFirst({
    where: {
      id: { not: organization.id },
      companyEmail: normalizedCompanyEmail,
    },
    select: { id: true },
  });

  if (duplicateEmail) {
    return NextResponse.json({ error: "Another company already uses this email. Please use a different company email." }, { status: 409 });
  }

  try {
    const organizationUpdate = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        name: normalizedName,
        companyEmail: normalizedCompanyEmail,
        website: toNullable(data.website),
        logo: normalizeStorageKey(data.logo),
        domain: toNullable(data.domain),
        industry: toNullable(data.industry),
        size: toNullable(data.size),
        region: toNullable(data.region),
        hqLocation: toNullable(data.hqLocation),
        billingEmail: data.billingEmail.trim(),
        phone: toNullable(data.phone),
        description: toNullable(data.description),
      },
      select: orgSelectAdmin,
    });

    const organizationResponse = {
      ...organizationUpdate,
      logo: organizationUpdate.logo ?? null,
      logoKey: organizationUpdate.logo ?? null,
      logoUrl: buildPublicUrlFromKey(organizationUpdate.logo),
    };

    return NextResponse.json({ organization: organizationResponse });
  } catch (error) {
    console.error("[company] failed to update organization", error);
    return NextResponse.json({ error: "Unable to save company" }, { status: 500 });
  }
}
