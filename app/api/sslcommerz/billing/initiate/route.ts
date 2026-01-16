import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { BillingCycle, PlanTier, SubscriptionStatus } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { pricingPlans } from "@/app/data/pricing";

export const dynamic = "force-dynamic";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

const initSchema = z.object({
  action: z.enum(["plan", "topup", "invoice"]),
  planSlug: z.string().trim().optional(),
  credits: z.number().int().positive().optional(),
  billingEmail: z.string().trim().email().optional(),
  paymentDetails: z
    .object({
      method: z.string().trim().optional(),
      provider: z.string().trim().optional(),
      accountName: z.string().trim().optional(),
      accountNumber: z.string().trim().optional(),
      routingNumber: z.string().trim().optional(),
      mobileWallet: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    })
    .optional(),
});

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

function getSslcommerzConfig(request: NextRequest) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const apiUrl = process.env.SSLCOMMERZ_API_URL?.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || request.nextUrl.origin;
  const callbackUrl = new URL("/api/sslcommerz/billing/callback", baseUrl).toString();

  if (!storeId || !storePassword || !apiUrl) {
    return null;
  }

  return { storeId, storePassword, apiUrl, callbackUrl };
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = initSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment details", details: parsed.error.flatten() }, { status: 400 });
  }

  const { action, planSlug: requestedPlanSlug, credits, billingEmail, paymentDetails } = parsed.data;
  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  const userId = (token as any)?.id as string | undefined;
  const role = (token as any)?.role as string | undefined;
  if (!userId || role !== "COMPANY_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultOrgId: true },
  });
  if (!user?.defaultOrgId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.defaultOrgId },
    select: {
      id: true,
      name: true,
      planSlug: true,
      companyEmail: true,
      billingEmail: true,
      hqLocation: true,
      region: true,
      phone: true,
      owner: { select: { name: true, phone: true } },
      paymentDetails: true,
    },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const config = getSslcommerzConfig(request);
  if (!config) {
    return NextResponse.json({ error: "SSLCommerz is not configured" }, { status: 500 });
  }

  const targetPlanSlug = requestedPlanSlug?.trim() || organization.planSlug || "standard";
  const planDetails = await resolvePlanDetails(targetPlanSlug);
  if (!planDetails) {
    return NextResponse.json({ error: "Selected plan not found" }, { status: 400 });
  }

  const planPrice = typeof (planDetails as any)?.price === "number" ? (planDetails as any).price : 0;
  const planTopUp = typeof (planDetails as any)?.topUp === "number" ? (planDetails as any).topUp : 0;
  const planName = (planDetails as any)?.name ?? targetPlanSlug;

  if (action === "plan" && targetPlanSlug === organization.planSlug) {
    return NextResponse.json({ error: "You are already on this plan." }, { status: 400 });
  }

  if (action === "plan" && planPrice <= 0) {
    const metrics = buildPlanMetrics(planDetails, targetPlanSlug);
    const renewsOn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        planSlug: targetPlanSlug,
        planTier: metrics.planTier,
        seatLimit: metrics.seatLimit,
        resumeAllotment: metrics.resumeAllotment,
        creditsBalance: metrics.creditsBalance,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        billingCycle: BillingCycle.MONTHLY,
        renewsOn,
        status: "COMPLETED",
        startsOn: new Date(),
        paymentDetails: paymentDetails ?? organization.paymentDetails ?? undefined,
      },
    });

    return NextResponse.json({ completed: true });
  }

  if (action === "topup" && (!credits || credits <= 0)) {
    return NextResponse.json({ error: "Credits amount is required." }, { status: 400 });
  }

  if (action === "topup" && planTopUp <= 0) {
    return NextResponse.json({ error: "Top-up pricing is not configured." }, { status: 400 });
  }

  let totalAmount = planPrice;
  let productName = `CarriX ${planName} Plan`;
  let valueC = "";

  if (action === "topup") {
    totalAmount = Math.round((credits! / 100) * planTopUp);
    productName = `CarriX Credits Top-up (${credits} credits)`;
    valueC = String(credits);
  } else if (action === "invoice") {
    totalAmount = planPrice;
    productName = `CarriX ${planName} Monthly Invoice`;
  }

  if (totalAmount <= 0) {
    return NextResponse.json({ error: "Payment amount must be greater than zero." }, { status: 400 });
  }

  const transactionId = `CXB-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

  const params = new URLSearchParams({
    store_id: config.storeId,
    store_passwd: config.storePassword,
    total_amount: totalAmount.toString(),
    currency: "BDT",
    tran_id: transactionId,
    success_url: config.callbackUrl,
    fail_url: config.callbackUrl,
    cancel_url: config.callbackUrl,
    cus_name: organization.owner?.name ?? "Company Admin",
    cus_email: billingEmail ?? organization.billingEmail ?? organization.companyEmail ?? "billing@carrix.ai",
    cus_add1: organization.hqLocation ?? "N/A",
    cus_city: organization.region ?? "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: organization.phone ?? organization.owner?.phone ?? "0000000000",
    shipping_method: "NO",
    product_name: productName,
    product_category: action === "topup" ? "Credits" : "Subscription",
    product_profile: "digital",
    value_a: action,
    value_b: targetPlanSlug,
    value_c: valueC,
    value_d: organization.id,
  });

  // Persist payment preference on org for reconciliation/billing.
  if (paymentDetails) {
    await prisma.organization.update({
      where: { id: organization.id },
      data: { paymentDetails },
    });
  }

  let apiResponse: any = null;
  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    apiResponse = await response.json();
  } catch (error) {
    console.error("[sslcommerz/billing/initiate] Failed to create session", error);
    return NextResponse.json({ error: "Unable to reach payment gateway right now." }, { status: 502 });
  }

  if (!apiResponse || apiResponse.status !== "SUCCESS" || !apiResponse.GatewayPageURL) {
    console.error("[sslcommerz/billing/initiate] Gateway error", apiResponse);
    return NextResponse.json({ error: "Payment gateway did not return a session URL." }, { status: 502 });
  }

  return NextResponse.json({
    gatewayUrl: apiResponse.GatewayPageURL,
    transactionId,
  });
}
