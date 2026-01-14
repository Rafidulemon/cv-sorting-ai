import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { MembershipStatus, PlanTier, UserRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { assertMailerConfig, sendEmail } from "@/app/lib/mailer";
import { buildSignupConfirmationEmail } from "@/app/lib/emailTemplates";

export const dynamic = "force-dynamic";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .trim();

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(140),
  personalEmail: z.string().trim().email("A valid personal email is required").max(180),
  companyEmail: z.string().trim().email("A valid company email is required").max(180),
  companyPhone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  companyName: z.string().trim().min(2, "Company name is required").max(180),
  companySlug: z.string().trim().max(80).optional().or(z.literal("")),
  website: z.string().trim().url().max(200).optional().or(z.literal("")),
  domain: z.string().trim().max(140).optional().or(z.literal("")),
  industry: z.string().trim().max(140).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  address: z.string().trim().min(3, "Address is required").max(240),
  region: z.string().trim().max(140).optional().or(z.literal("")),
  billingEmail: z.string().trim().email("A billing contact is required").max(180).optional().or(z.literal("")),
  logoKey: z.string().trim().max(500).optional().or(z.literal("")),
  logoUrl: z.string().trim().max(500).optional().or(z.literal("")),
  designation: z.string().trim().max(140).optional().or(z.literal("")),
  companySize: z.string().trim().max(80).optional().or(z.literal("")),
  preferredPlan: z.string().trim().max(80).optional().or(z.literal("")),
});

function normalizeEmail(value: string) {
  return value.toLowerCase().trim();
}

function toNullable(value?: string | null) {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

const planDefaultsBySlug: Record<
  string,
  { label: string; monthlyCredits: number; approxCvAllowance: number; seatLimit: number }
> = {
  free: { label: "Free", monthlyCredits: 10, approxCvAllowance: 6, seatLimit: 1 },
  standard: { label: "Standard", monthlyCredits: 1500, approxCvAllowance: 1000, seatLimit: 5 },
  premium: { label: "Premium", monthlyCredits: 3500, approxCvAllowance: 2300, seatLimit: 10 },
};

async function generateOrgSlug(candidate: string | null, name: string) {
  const base = (candidate && candidate.trim().length ? slugify(candidate) : slugify(name)) || "workspace";
  let slug = base;
  let attempt = 1;
  while (attempt < 50) {
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${attempt}`;
    attempt += 1;
  }
  return `${base}-${Date.now()}`;
}

function resolvePlanTier(slug: string): PlanTier {
  if (slug === "free") return PlanTier.FREEMIUM;
  if (slug === "premium") return PlanTier.ENTERPRISE;
  return PlanTier.STANDARD;
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

export async function POST(request: NextRequest) {
  try {
    assertMailerConfig();
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Email is not configured" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const personalEmail = normalizeEmail(data.personalEmail);
  const companyEmail = normalizeEmail(data.companyEmail);
  const billingEmail = data.billingEmail?.trim() ? data.billingEmail.trim() : companyEmail;
  const normalizedSlug = data.companySlug?.trim() ? slugify(data.companySlug) : null;

  const existingUser = await prisma.user.findUnique({ where: { email: personalEmail } });
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
  }

  if (normalizedSlug) {
    const existingSlug = await prisma.organization.findUnique({ where: { slug: normalizedSlug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Company slug is already taken. Please choose another." }, { status: 409 });
    }
  }

  const existingOrgByName = await prisma.organization.findFirst({
    where: { name: { equals: data.companyName.trim(), mode: "insensitive" } },
  });
  if (existingOrgByName) {
    return NextResponse.json({ error: "A company with this name already exists. Please choose another." }, { status: 409 });
  }

  const existingOrgByEmail = await prisma.organization.findFirst({
    where: { companyEmail: companyEmail },
  });
  if (existingOrgByEmail) {
    return NextResponse.json({ error: "A company with this email already exists. Please use another company email." }, { status: 409 });
  }

  const planSlug = data.preferredPlan?.trim() || "standard";
  const planDefaults = planDefaultsBySlug[planSlug] ?? planDefaultsBySlug.standard;
  const logoKey = normalizeStorageKey(data.logoKey ?? data.logoUrl);

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 hours
  const token = crypto.randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(data.password, 10);

  const slug = await generateOrgSlug(normalizedSlug, data.companyName);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name.trim(),
        email: personalEmail,
        passwordHash,
        profileStatus: MembershipStatus.PENDING,
        role: UserRole.COMPANY_ADMIN,
        phone: toNullable(data.phone),
        designation: toNullable(data.designation),
        emailVerified: null,
      },
    });

    const organization = await tx.organization.create({
      data: {
        name: data.companyName.trim(),
        slug,
        ownerId: user.id,
        createdById: user.id,
        companyEmail,
        billingEmail,
        planTier: resolvePlanTier(planSlug),
        website: toNullable(data.website),
        domain: toNullable(data.domain),
        industry: toNullable(data.industry),
        description: toNullable(data.description),
        hqLocation: toNullable(data.address),
        region: toNullable(data.region),
        logo: logoKey,
        phone: toNullable(data.companyPhone),
        size: toNullable(data.companySize),
        planSlug,
        seatLimit: planDefaults.seatLimit,
        resumeAllotment: planDefaults.approxCvAllowance,
        creditsBalance: planDefaults.monthlyCredits,
        status: "PENDING",
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { defaultOrgId: organization.id },
    });

    await tx.verificationToken.deleteMany({
      where: { identifier: `org:${organization.id}` },
    });

    await tx.verificationToken.create({
      data: {
        identifier: `org:${organization.id}`,
        token,
        expires: expiresAt,
      },
    });

    return { user, organization };
  });

  const confirmUrl = new URL("/auth/signup/confirm", request.nextUrl.origin);
  confirmUrl.searchParams.set("token", token);

  const emailContent = buildSignupConfirmationEmail({
    name: data.name,
    companyName: data.companyName,
    confirmUrl: confirmUrl.toString(),
    expiresAt,
  });

  try {
    await sendEmail({
      to: personalEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  } catch (error) {
    console.error("[auth/signup] Failed to send confirmation email", error);
    return NextResponse.json({ error: "Unable to send confirmation email right now. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Confirmation email sent. Please check your inbox to continue.",
    expiresAt,
    organizationId: result.organization.id,
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const verification = await prisma.verificationToken.findUnique({ where: { token } });
  if (!verification) {
    return NextResponse.json({ error: "Signup verification not found" }, { status: 404 });
  }
  const now = new Date();
  if (verification.expires < now) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: "This confirmation link has expired." }, { status: 410 });
  }

  const identifier = verification.identifier;
  if (!identifier?.startsWith("org:")) {
    return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
  }
  const orgId = identifier.replace("org:", "");

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { owner: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Mark email verified for the owner and organization if not already.
  if (organization.status === "PENDING") {
    await prisma.organization.update({
      where: { id: organization.id },
      data: { status: "EMAIL_VERIFIED" },
    });
  }
  if (!organization.owner?.emailVerified) {
    await prisma.user.update({
      where: { id: organization.ownerId },
      data: { emailVerified: new Date() },
    });
  }

  return NextResponse.json({
    signup: {
      name: organization.owner?.name ?? "",
      email: organization.companyEmail ?? organization.billingEmail ?? "",
      companyName: organization.name,
      companySlug: organization.slug,
      planSlug: organization.planSlug ?? "standard",
      billingEmail: organization.billingEmail ?? organization.companyEmail ?? "",
      website: organization.website ?? "",
      domain: organization.domain ?? "",
      industry: organization.industry ?? "",
      description: organization.description ?? "",
      address: organization.hqLocation ?? "",
      region: organization.region ?? "",
      logoKey: organization.logo ?? "",
      logoUrl: buildPublicUrlFromKey(organization.logo) ?? "",
      status: organization.status,
      expiresAt: verification.expires.toISOString(),
      organizationId: organization.id,
    },
  });
}
