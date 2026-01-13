import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BillingCycle, PlanTier, SubscriptionStatus } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { pricingPlans } from "@/app/data/pricing";
import { sendEmail } from "@/app/lib/mailer";
import { buildSignupCompleteEmail, buildSignupInvoiceEmail } from "@/app/lib/emailTemplates";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().min(10, "Missing signup token"),
  planSlug: z.string().trim().min(2, "Plan is required"),
  billingEmail: z.string().trim().email("A billing contact is required"),
  paymentConfirmed: z.boolean().optional(),
});

const planDefaults: Record<
  string,
  { tier: PlanTier; seats: number; resumeAllotment: number; credits: number }
> = {
  free: { tier: PlanTier.FREEMIUM, seats: 1, resumeAllotment: 6, credits: 10 },
  standard: { tier: PlanTier.STANDARD, seats: 5, resumeAllotment: 1000, credits: 1500 },
  premium: { tier: PlanTier.ENTERPRISE, seats: 10, resumeAllotment: 2300, credits: 3500 },
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function slugifyCompanyName(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .trim();
  return base.length ? base : "workspace";
}

async function generateOrgSlug(name: string) {
  const base = slugifyCompanyName(name);
  let slug = base;
  let attempt = 1;

  // Limit attempts to prevent infinite loops.
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
  if (slug === "standard") return PlanTier.STANDARD;
  if (slug === "premium") return PlanTier.ENTERPRISE;
  return PlanTier.STANDARD;
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid completion details", details: parsed.error.flatten() }, { status: 400 });
  }

  const { token, planSlug, billingEmail, paymentConfirmed } = parsed.data;
  const signupRequest = await prisma.signupRequest.findUnique({ where: { token } });

  if (!signupRequest) {
    return NextResponse.json({ error: "Signup request not found" }, { status: 404 });
  }

  const now = new Date();
  if (signupRequest.status === "COMPLETED") {
    return NextResponse.json({ error: "This signup has already been completed." }, { status: 410 });
  }

  if (signupRequest.expiresAt < now) {
    await prisma.signupRequest.update({
      where: { id: signupRequest.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "This confirmation link has expired." }, { status: 410 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: signupRequest.email } });
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
  }

  const planFromDb = await prisma.pricingPlan.findUnique({ where: { slug: planSlug } });
  const planFromStatic = pricingPlans.find((plan) => plan.slug === planSlug);

  if (!planFromDb && !planFromStatic) {
    return NextResponse.json({ error: "Selected plan not found" }, { status: 400 });
  }

  if (!planFromDb && planFromStatic) {
    await prisma.pricingPlan.create({
      data: {
        slug: planFromStatic.slug,
        name: planFromStatic.name,
        description: planFromStatic.description,
        price: planFromStatic.price,
        period: planFromStatic.period,
        cta: planFromStatic.cta,
        highlight: Boolean(planFromStatic.highlight),
        features: planFromStatic.features,
        topUp: planFromStatic.topUp,
        monthlyCredits: planFromStatic.monthlyCredits,
        approxCvs: planFromStatic.approxCvs,
        activeJobs: planFromStatic.activeJobs,
        team: planFromStatic.team,
        support: planFromStatic.support,
        apiAccess: planFromStatic.apiAccess,
        askAi: planFromStatic.askAi,
        aiJd: planFromStatic.aiJd,
        ocr: planFromStatic.ocr,
        semanticSearch: planFromStatic.semanticSearch,
        sortOrder: planFromStatic.sortOrder ?? 0,
      },
    });
  }

  const planRecord = planFromDb ?? (await prisma.pricingPlan.findUnique({ where: { slug: planSlug } }));
  const planDetails = planRecord ?? planFromStatic!;
  const defaultPlan = planDefaults[planSlug] ?? {
    tier: resolvePlanTier(planSlug),
    seats: typeof (planDetails as any)?.team === "number" ? (planDetails as any).team : 1,
    resumeAllotment: 50,
    credits: typeof (planDetails as any)?.monthlyCredits === "number" ? (planDetails as any).monthlyCredits : 0,
  };

  const planTier = defaultPlan.tier;
  const seatLimit = Math.max(
    typeof (planDetails as any)?.team === "number" ? (planDetails as any).team : defaultPlan.seats,
    1,
  );
  const resumeAllotment = Math.max(
    typeof (planDetails as any)?.approxCvs === "string"
      ? Number.parseInt((planDetails as any).approxCvs.replace(/[^\d]/g, ""), 10) || defaultPlan.resumeAllotment
      : defaultPlan.resumeAllotment,
    1,
  );
  const creditsBalance =
    typeof (planDetails as any)?.monthlyCredits === "number" ? (planDetails as any).monthlyCredits : defaultPlan.credits;
  const planName = (planDetails as any)?.name ?? planSlug;
  const planPrice = typeof (planDetails as any)?.price === "number" ? (planDetails as any).price : 0;
  const requiresPayment = planPrice > 0;

  if (requiresPayment && !paymentConfirmed) {
    return NextResponse.json({ error: "Please confirm payment to finalize signup." }, { status: 400 });
  }

  const organizationSlug = await generateOrgSlug(signupRequest.companyName);
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
  const dashboardUrl = new URL("/dashboard", request.nextUrl.origin).toString();

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: signupRequest.name,
        email: signupRequest.email,
        passwordHash: signupRequest.passwordHash,
        emailVerified: new Date(),
      },
    });

    const organization = await tx.organization.create({
      data: {
        name: signupRequest.companyName,
        slug: organizationSlug,
        ownerId: user.id,
        createdById: user.id,
        planTier,
        planSlug,
        seatLimit,
        resumeAllotment,
        creditsBalance,
        billingEmail,
      },
    });

    await tx.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "COMPANY_ADMIN",
        status: "ACTIVE",
        lastActiveAt: new Date(),
      },
    });

    await tx.organizationSubscription.create({
      data: {
        organizationId: organization.id,
        plan: planTier,
        planSlug,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        seats: seatLimit,
        resumesIncluded: resumeAllotment,
        renewsOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await tx.signupRequest.update({
      where: { id: signupRequest.id },
      data: { status: "COMPLETED", planSlug, billingEmail, completedAt: new Date() },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { defaultOrgId: organization.id },
    });

    return { user, organization };
  });

  try {
    const invoiceEmail = buildSignupInvoiceEmail({
      name: signupRequest.name,
      companyName: signupRequest.companyName,
      planName,
      planPrice,
      billingEmail,
      seats: seatLimit,
      invoiceNumber,
    });

    const completionEmail = buildSignupCompleteEmail({
      name: signupRequest.name,
      companyName: signupRequest.companyName,
      dashboardUrl,
    });

    await Promise.all([
      sendEmail({ to: billingEmail, subject: invoiceEmail.subject, html: invoiceEmail.html, text: invoiceEmail.text }),
      sendEmail({
        to: signupRequest.email,
        subject: completionEmail.subject,
        html: completionEmail.html,
        text: completionEmail.text,
      }),
    ]);
  } catch (error) {
    console.error("[auth/signup/complete] Failed to send completion emails", error);
    return NextResponse.json(
      { error: "Workspace created, but we could not send confirmation emails. Please check email settings." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    organization: {
      id: result.organization.id,
      slug: result.organization.slug,
      name: result.organization.name,
    },
    plan: {
      slug: planSlug,
      name: planName,
      price: currencyFormatter.format(planPrice),
      seats: seatLimit,
    },
    invoiceNumber,
  });
}
