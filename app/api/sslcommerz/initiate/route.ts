import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { pricingPlans } from "@/app/data/pricing";

export const dynamic = "force-dynamic";

const initSchema = z.object({
  token: z.string().min(10, "Missing signup token"),
  planSlug: z.string().trim().min(2, "Plan is required"),
  billingEmail: z.string().trim().email("A billing contact is required"),
});

function getSslcommerzConfig(request: NextRequest) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const apiUrl = process.env.SSLCOMMERZ_API_URL?.trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || request.nextUrl.origin;
  const fallbackCallback = new URL("/api/sslcommerz/callback", baseUrl).toString();
  const envCallback = process.env.SSLCOMMERZ_CALLBACK_URL?.trim();
  const callbackUrl =
    envCallback && envCallback.includes("/api/sslcommerz/callback") ? envCallback : fallbackCallback;

  if (!storeId || !storePassword || !apiUrl) {
    return null;
  }

  return { storeId, storePassword, apiUrl, callbackUrl };
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

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = initSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment details", details: parsed.error.flatten() }, { status: 400 });
  }

  const { token, planSlug, billingEmail } = parsed.data;
  const config = getSslcommerzConfig(request);
  if (!config) {
    return NextResponse.json({ error: "SSLCommerz is not configured" }, { status: 500 });
  }

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

  const planDetails = await resolvePlanDetails(planSlug);
  if (!planDetails) {
    return NextResponse.json({ error: "Selected plan not found" }, { status: 400 });
  }

  const planPrice = typeof (planDetails as any)?.price === "number" ? (planDetails as any).price : 0;
  if (planPrice <= 0) {
    return NextResponse.json({ error: "Selected plan does not require payment." }, { status: 400 });
  }

  const planName = (planDetails as any)?.name ?? planSlug;
  const transactionId = `CX-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

  const params = new URLSearchParams({
    store_id: config.storeId,
    store_passwd: config.storePassword,
    total_amount: planPrice.toString(),
    currency: "BDT",
    tran_id: transactionId,
    success_url: config.callbackUrl,
    fail_url: config.callbackUrl,
    cancel_url: config.callbackUrl,
    cus_name: organization.owner?.name ?? "Company Admin",
    cus_email: billingEmail,
    cus_add1: organization.hqLocation ?? "N/A",
    cus_city: organization.region ?? "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: organization.phone ?? organization.owner?.phone ?? "0000000000",
    shipping_method: "NO",
    product_name: `CarriX ${planName} Plan`,
    product_category: "Subscription",
    product_profile: "digital",
    value_a: token,
    value_b: planSlug,
    value_c: billingEmail,
    value_d: organization.id,
  });

  let apiResponse: any = null;
  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    apiResponse = await response.json();
  } catch (error) {
    console.error("[sslcommerz/initiate] Failed to create session", error);
    return NextResponse.json({ error: "Unable to reach payment gateway right now." }, { status: 502 });
  }

  if (!apiResponse || apiResponse.status !== "SUCCESS" || !apiResponse.GatewayPageURL) {
    console.error("[sslcommerz/initiate] Gateway error", apiResponse);
    return NextResponse.json({ error: "Payment gateway did not return a session URL." }, { status: 502 });
  }

  return NextResponse.json({
    gatewayUrl: apiResponse.GatewayPageURL,
    transactionId,
  });
}
