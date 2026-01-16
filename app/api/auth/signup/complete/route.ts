import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BillingCycle, MembershipStatus, PlanTier, SubscriptionStatus, CreditLedgerType } from "@prisma/client";
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
  paymentReference: z
    .object({
      provider: z.string().trim().min(1),
      transactionId: z.string().trim().min(3),
      validationId: z.string().trim().min(3),
      amount: z.coerce.number().optional(),
      currency: z.string().trim().min(1).optional(),
      cardType: z.string().trim().optional(),
    })
    .optional(),
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

function toNullable(value?: string | null) {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function resolvePlanTier(slug: string): PlanTier {
  if (slug === "free") return PlanTier.FREEMIUM;
  if (slug === "standard") return PlanTier.STANDARD;
  if (slug === "premium") return PlanTier.ENTERPRISE;
  return PlanTier.STANDARD;
}

async function validateSslcommerzPayment(transactionId: string, validationId: string, expectedAmount: number) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const validationApi =
    process.env.SSLCOMMERZ_VALIDATION_API_WEB?.trim() ??
    process.env.SSLCOMMERZ_VALIDATION_API?.trim();

  if (!storeId || !storePassword || !validationApi) {
    throw new Error("SSLCommerz validation is not configured");
  }

  const url = new URL(validationApi);
  url.searchParams.set("val_id", validationId);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePassword);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), { method: "GET" });
  if (!response.ok) {
    throw new Error("Validation request failed");
  }

  const payload = await response.json();
  const status = (payload?.status ?? "").toString();
  if (status !== "VALID" && status !== "VALIDATED") {
    return { valid: false, payload };
  }

  const validatedAmount = Number.parseFloat(payload?.amount ?? "0");
  if (!Number.isFinite(validatedAmount) || Math.abs(validatedAmount - expectedAmount) > 0.5) {
    return { valid: false, payload };
  }

  const validatedTranId = (payload?.tran_id ?? "").toString();
  if (validatedTranId && validatedTranId !== transactionId) {
    return { valid: false, payload };
  }

  const currency = (payload?.currency_type ?? payload?.currency ?? "").toString();
  if (currency && currency !== "BDT") {
    return { valid: false, payload };
  }

  return { valid: true, payload };
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

  const { token, planSlug, billingEmail, paymentReference } = parsed.data;

  const verification = await prisma.verificationToken.findUnique({ where: { token } });
  if (!verification) {
    return NextResponse.json({ error: "Verification not found" }, { status: 404 });
  }
  const now = new Date();
  if (verification.expires < now) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: "This confirmation link has expired." }, { status: 410 });
  }

  if (!verification.identifier?.startsWith("org:")) {
    return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
  }
  const orgId = verification.identifier.replace("org:", "");

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { owner: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  if (organization.status === "COMPLETED") {
    return NextResponse.json({ error: "This signup has already been completed." }, { status: 410 });
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
  const paymentProvider = paymentReference?.provider?.trim();
  const providerCode = paymentProvider?.toUpperCase();
  const referenceType =
    providerCode === "SSLCOMMERZ"
      ? "SSLCommerz"
      : paymentProvider ?? (requiresPayment ? "SSLCommerz" : "Signup");

  if (requiresPayment) {
    if (!paymentReference?.transactionId || !paymentReference?.validationId) {
      return NextResponse.json(
        { error: "Payment verification required. Please complete payment to finalize signup." },
        { status: 400 },
      );
    }
    if (providerCode !== "SSLCOMMERZ") {
      return NextResponse.json({ error: "Unsupported payment provider." }, { status: 400 });
    }
    try {
      const validation = await validateSslcommerzPayment(
        paymentReference.transactionId,
        paymentReference.validationId,
        planPrice,
      );
      if (!validation.valid) {
        return NextResponse.json({ error: "Payment could not be verified. Please try again." }, { status: 400 });
      }
    } catch (error) {
      console.error("[auth/signup/complete] Payment validation failed", error);
      return NextResponse.json({ error: "Unable to verify payment right now." }, { status: 502 });
    }
  }

  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
  const dashboardUrl = new URL("/dashboard", request.nextUrl.origin).toString();
  const referenceId = paymentReference?.transactionId ?? invoiceNumber;

  const result = await prisma.$transaction(async (tx) => {
    const renewsOn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const updatedOrg = await tx.organization.update({
      where: { id: organization.id },
      data: {
        planTier,
        planSlug,
        seatLimit,
        resumeAllotment,
        creditsBalance,
        billingEmail: billingEmail ?? organization.billingEmail,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        renewsOn,
        startsOn: organization.startsOn ?? new Date(),
        status: "COMPLETED",
        provider: providerCode ?? paymentReference?.provider ?? organization.provider,
        externalSubscriptionId: paymentReference?.transactionId ?? organization.externalSubscriptionId,
        externalCustomerId: paymentReference?.validationId ?? organization.externalCustomerId,
      },
      include: { owner: true },
    });

    if (requiresPayment) {
      await tx.creditLedger.create({
        data: {
          organizationId: organization.id,
          amount: creditsBalance,
          type: CreditLedgerType.ALLOTMENT,
          referenceType,
          referenceId,
          description: `Signup ${planName} plan (${planSlug})`,
        },
      });
    }

    await tx.user.update({
      where: { id: organization.ownerId },
      data: {
        profileStatus: MembershipStatus.ACTIVE,
        role: "COMPANY_ADMIN",
        defaultOrgId: organization.id,
        startedAt: organization.owner?.startedAt ?? new Date(),
      },
    });

    await tx.verificationToken.deleteMany({ where: { identifier: `org:${organization.id}` } });

    return updatedOrg;
  });

  try {
    const invoiceEmail = buildSignupInvoiceEmail({
      name: result.owner?.name,
      companyName: result.name,
      planName,
      planPrice,
      billingEmail: billingEmail ?? organization.billingEmail ?? organization.companyEmail ?? "",
      seats: seatLimit,
      invoiceNumber,
    });

    const completionEmail = buildSignupCompleteEmail({
      name: result.owner?.name,
      companyName: result.name,
      dashboardUrl,
    });

    await Promise.all([
      sendEmail({
        to: billingEmail ?? organization.billingEmail ?? organization.companyEmail ?? "",
        subject: invoiceEmail.subject,
        html: invoiceEmail.html,
        text: invoiceEmail.text,
      }),
      sendEmail({
        to: organization.owner?.email ?? billingEmail ?? organization.companyEmail ?? "",
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
      id: result.id,
      slug: result.slug,
      name: result.name,
      status: result.status,
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
