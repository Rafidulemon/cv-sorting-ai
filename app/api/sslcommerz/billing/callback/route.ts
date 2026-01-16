import { NextResponse, type NextRequest } from "next/server";
import { BillingCycle, CreditLedgerType, PlanTier, SubscriptionStatus } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { pricingPlans } from "@/app/data/pricing";
import { sendEmail } from "@/app/lib/mailer";
import { buildPaymentReceiptEmail } from "@/app/lib/emailTemplates";

export const dynamic = "force-dynamic";

const planDefaults: Record<string, { tier: PlanTier; seats: number; resumeAllotment: number; credits: number }> = {
  free: { tier: PlanTier.FREEMIUM, seats: 1, resumeAllotment: 6, credits: 10 },
  standard: { tier: PlanTier.STANDARD, seats: 5, resumeAllotment: 1000, credits: 1500 },
  premium: { tier: PlanTier.ENTERPRISE, seats: 10, resumeAllotment: 2300, credits: 3500 },
};

function resolvePlanTier(slug: string): PlanTier {
  if (slug === "free") return PlanTier.FREEMIUM;
  if (slug === "premium") return PlanTier.ENTERPRISE;
  return PlanTier.STANDARD;
}

function getFieldValue(fields: Record<string, string>, key: string) {
  return fields[key] ?? "";
}

function formDataToRecord(formData: FormData) {
  const record: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      record[key] = value;
    }
  }
  return record;
}

function searchParamsToRecord(params: URLSearchParams) {
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

async function resolvePlanDetails(planSlug: string) {
  const planFromDb = await prisma.pricingPlan.findUnique({ where: { slug: planSlug } });
  const planFromStatic = pricingPlans.find((plan) => plan.slug === planSlug);

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

  return planFromDb ?? (await prisma.pricingPlan.findUnique({ where: { slug: planSlug } })) ?? planFromStatic ?? null;
}

function buildPlanMetrics(planDetails: any, planSlug: string) {
  const fallback = planDefaults[planSlug] ?? {
    tier: resolvePlanTier(planSlug),
    seats: typeof planDetails?.team === "number" ? planDetails.team : 1,
    resumeAllotment: 50,
    credits: typeof planDetails?.monthlyCredits === "number" ? planDetails.monthlyCredits : 0,
  };

  const seatLimit = Math.max(typeof planDetails?.team === "number" ? planDetails.team : fallback.seats, 1);
  const resumeAllotment = Math.max(
    typeof planDetails?.approxCvs === "string"
      ? Number.parseInt(planDetails.approxCvs.replace(/[^\d]/g, ""), 10) || fallback.resumeAllotment
      : fallback.resumeAllotment,
    1,
  );
  const creditsBalance = typeof planDetails?.monthlyCredits === "number" ? planDetails.monthlyCredits : fallback.credits;

  return {
    planTier: fallback.tier,
    seatLimit,
    resumeAllotment,
    creditsBalance,
  };
}

async function validatePayment(valId: string, origin: string) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const validationApi =
    process.env.SSLCOMMERZ_VALIDATION_API_WEB?.trim() ??
    process.env.SSLCOMMERZ_VALIDATION_API?.trim() ??
    "";

  if (!storeId || !storePassword || !validationApi) {
    throw new Error("Missing SSLCommerz validation settings");
  }

  const url = new URL(validationApi, origin);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePassword);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), { method: "GET" });
  if (!response.ok) {
    throw new Error("Validation request failed");
  }

  return response.json();
}

function buildRedirect(request: NextRequest, status: string, action?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || request.nextUrl.origin;
  const redirectUrl = new URL("/credits", baseUrl);
  redirectUrl.searchParams.set("payment", status);
  if (action) {
    redirectUrl.searchParams.set("action", action);
  }
  return redirectUrl;
}

async function handleCallback(fields: Record<string, string>, request: NextRequest) {
  const status = getFieldValue(fields, "status");
  const action = getFieldValue(fields, "value_a");
  const planSlug = getFieldValue(fields, "value_b");
  const creditsValue = getFieldValue(fields, "value_c");
  const orgId = getFieldValue(fields, "value_d");
  const transactionId = getFieldValue(fields, "tran_id");
  const validationId = getFieldValue(fields, "val_id");
  const amount = getFieldValue(fields, "amount");
  const currency = getFieldValue(fields, "currency");

  if (status !== "VALID" && status !== "VALIDATED") {
    const redirectUrl = buildRedirect(request, "failed", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (!validationId || !transactionId || !orgId || !action) {
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  let validationPayload: any;
  try {
    validationPayload = await validatePayment(validationId, request.nextUrl.origin);
  } catch (error) {
    console.error("[sslcommerz/billing/callback] Validation error", error);
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const validationStatus = (validationPayload?.status ?? "").toString();
  if (validationStatus !== "VALID" && validationStatus !== "VALIDATED") {
    const redirectUrl = buildRedirect(request, "failed", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const validatedTranId = (validationPayload?.tran_id ?? "").toString();
  if (validatedTranId && validatedTranId !== transactionId) {
    console.error("[sslcommerz/billing/callback] Transaction mismatch", { validatedTranId, transactionId });
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      planSlug: true,
      creditsBalance: true,
      resumeAllotment: true,
      name: true,
      billingEmail: true,
      companyEmail: true,
      owner: { select: { email: true, name: true } },
    },
  });

  if (!organization) {
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const effectivePlanSlug = planSlug || organization.planSlug || "standard";
  const planDetails = await resolvePlanDetails(effectivePlanSlug);
  if (!planDetails) {
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const planPrice = typeof (planDetails as any)?.price === "number" ? (planDetails as any).price : 0;
  const planTopUp = typeof (planDetails as any)?.topUp === "number" ? (planDetails as any).topUp : 0;
  const credits = Number.parseInt(creditsValue, 10) || 0;

  let expectedAmount = planPrice;
  if (action === "topup") {
    expectedAmount = Math.round((credits / 100) * planTopUp);
  }

  const validatedAmount = Number.parseFloat(validationPayload?.amount ?? amount ?? "0");
  if (!Number.isFinite(validatedAmount) || Math.abs(validatedAmount - expectedAmount) > 0.5) {
    console.error("[sslcommerz/billing/callback] Amount mismatch", { expectedAmount, validatedAmount });
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const validatedCurrency = (validationPayload?.currency_type ?? validationPayload?.currency ?? currency ?? "").toString();
  if (validatedCurrency && validatedCurrency !== "BDT") {
    console.error("[sslcommerz/billing/callback] Currency mismatch", { validatedCurrency });
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const renewsOn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const metrics = buildPlanMetrics(planDetails, effectivePlanSlug);
  const billingContact =
    organization.billingEmail ?? organization.companyEmail ?? organization.owner?.email ?? "billing@carrix.ai";
  const companyName = organization.name ?? "Your workspace";
  const invoiceNumber = transactionId;
  const issuedAt = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      if (action === "topup") {
        const nextBalance = Math.max(0, organization.creditsBalance ?? 0) + credits;
        await tx.organization.update({
          where: { id: organization.id },
          data: {
            creditsBalance: nextBalance,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            provider: "SSLCOMMERZ",
            externalSubscriptionId: transactionId,
            externalCustomerId: validationId,
          },
        });

        await tx.creditLedger.create({
          data: {
            organizationId: organization.id,
            amount: credits,
            type: CreditLedgerType.PURCHASE,
            referenceType: "SSLCommerz",
            referenceId: transactionId,
            description: `SSLCommerz top-up (${credits} credits)`,
          },
        });
        return;
      }

      if (action === "plan") {
        await tx.organization.update({
          where: { id: organization.id },
          data: {
            planSlug: effectivePlanSlug,
            planTier: metrics.planTier,
            seatLimit: metrics.seatLimit,
            resumeAllotment: metrics.resumeAllotment,
            creditsBalance: metrics.creditsBalance,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            billingCycle: BillingCycle.MONTHLY,
            renewsOn,
            status: "COMPLETED",
            provider: "SSLCOMMERZ",
            externalSubscriptionId: transactionId,
            externalCustomerId: validationId,
            startsOn: new Date(),
          },
        });
        await tx.creditLedger.create({
          data: {
            organizationId: organization.id,
            amount: metrics.creditsBalance,
            type: CreditLedgerType.ALLOTMENT,
            referenceType: "SSLCommerz",
            referenceId: transactionId,
            description: `Plan change (${effectivePlanSlug})`,
          },
        });
        return;
      }

      await tx.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          renewsOn,
          resumeAllotment: metrics.resumeAllotment,
          creditsBalance: metrics.creditsBalance,
          provider: "SSLCOMMERZ",
          externalSubscriptionId: transactionId,
          externalCustomerId: validationId,
        },
      });

      await tx.creditLedger.create({
        data: {
          organizationId: organization.id,
          amount: metrics.creditsBalance,
          type: CreditLedgerType.ALLOTMENT,
          referenceType: "SSLCommerz",
          referenceId: transactionId,
          description: `Invoice payment (${effectivePlanSlug})`,
        },
      });
    });
  } catch (error) {
    console.error("[sslcommerz/billing/callback] Update failed", error);
    const redirectUrl = buildRedirect(request, "error", action);
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  try {
    const receipt = buildPaymentReceiptEmail({
      companyName,
      planName: (planDetails as any)?.name ?? effectivePlanSlug,
      amountBdt: expectedAmount,
      credits: action === "topup" ? credits : metrics.creditsBalance,
      invoiceNumber,
      billingEmail: billingContact,
      issuedAt,
    });
    await sendEmail({ to: billingContact, ...receipt });
  } catch (error) {
    console.error("[sslcommerz/billing/callback] Failed to send receipt", error);
  }

  const redirectUrl = buildRedirect(request, "success", action);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return handleCallback(formDataToRecord(formData), request);
}

export async function GET(request: NextRequest) {
  const fields = searchParamsToRecord(request.nextUrl.searchParams);
  if (!Object.keys(fields).length) {
    return NextResponse.json({ error: "SSLCommerz callback expects POST." }, { status: 200 });
  }
  return handleCallback(fields, request);
}
