import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(140),
  website: z.string().trim().url().max(200).optional().or(z.literal("")),
  logo: z.string().trim().max(300).optional().or(z.literal("")),
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

  const membership = await prisma.membership.findFirst({
    where: tokenOrgId ? { userId, organizationId: tokenOrgId } : { userId },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true, role: true },
  });

  return {
    userId,
    organizationId: tokenOrgId ?? membership?.organizationId ?? null,
    role: membership?.role ?? ((token as any)?.role as string | undefined) ?? null,
  };
}

export async function GET(request: NextRequest) {
  const context = await getSessionContext(request);

  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: context.userId, organizationId: context.organizationId },
    select: { role: true, organizationId: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgSelect = membership.role === "COMPANY_ADMIN" ? orgSelectAdmin : orgSelectMember;

  const organization = await prisma.organization.findUnique({
    where: { id: membership.organizationId },
    select: orgSelect,
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({ organization, membershipRole: membership.role });
}

export async function PUT(request: NextRequest) {
  const context = await getSessionContext(request);

  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: context.userId, organizationId: context.organizationId },
    select: { role: true, organizationId: true },
  });

  if (!membership || membership.role !== "COMPANY_ADMIN") {
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

  try {
    const organization = await prisma.organization.update({
      where: { id: membership.organizationId },
      data: {
        name: data.name.trim(),
        website: toNullable(data.website),
        logo: toNullable(data.logo),
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

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("[company] failed to update organization", error);
    return NextResponse.json({ error: "Unable to save company" }, { status: 500 });
  }
}
