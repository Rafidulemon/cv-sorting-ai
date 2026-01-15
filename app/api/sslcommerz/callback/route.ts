import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { pricingPlans } from "@/app/data/pricing";

export const dynamic = "force-dynamic";

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

function buildRedirect(request: NextRequest, token?: string | null, status?: string) {
  if (status === "success") {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || request.nextUrl.origin;
    return new URL("/auth/login", baseUrl);
  }

  const redirectUrl = new URL("/auth/signup/confirm", "http://localhost:3000");
  if (token) {
    redirectUrl.searchParams.set("token", token);
  }
  if (status) {
    redirectUrl.searchParams.set("payment", status);
  }
  return redirectUrl;
}

async function handleCallback(fields: Record<string, string>, request: NextRequest) {
  const status =
    getFieldValue(fields, "status") ||
    getFieldValue(fields, "payment_status");
  const token =
    getFieldValue(fields, "value_a") ||
    getFieldValue(fields, "token");
  const planSlug =
    getFieldValue(fields, "value_b") ||
    getFieldValue(fields, "planSlug");
  const billingEmail =
    getFieldValue(fields, "value_c") ||
    getFieldValue(fields, "billingEmail") ||
    getFieldValue(fields, "cus_email");
  const transactionId =
    getFieldValue(fields, "tran_id") ||
    getFieldValue(fields, "transactionId");
  const validationId =
    getFieldValue(fields, "val_id") ||
    getFieldValue(fields, "validation_id");
  const amount = getFieldValue(fields, "amount");
  const currency =
    getFieldValue(fields, "currency") ||
    getFieldValue(fields, "currency_type");

  if (status !== "VALID" && status !== "VALIDATED") {
    const redirectUrl = buildRedirect(request, token, "failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (!validationId || !planSlug || !transactionId) {
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
  if (!billingEmail) {
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  let validationPayload: any;
  try {
    validationPayload = await validatePayment(validationId, request.nextUrl.origin);
  } catch (error) {
    console.error("[sslcommerz/callback] Validation error", error);
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const validationStatus = (validationPayload?.status ?? "").toString();
  if (validationStatus !== "VALID" && validationStatus !== "VALIDATED") {
    const redirectUrl = buildRedirect(request, token, "failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const validatedTranId = (validationPayload?.tran_id ?? "").toString();
  if (validatedTranId && validatedTranId !== transactionId) {
    console.error("[sslcommerz/callback] Transaction mismatch", { validatedTranId, transactionId });
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const planDetails = await resolvePlanDetails(planSlug);
  if (!planDetails) {
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const expectedAmount = typeof (planDetails as any)?.price === "number" ? (planDetails as any).price : 0;
  const validatedAmount = Number.parseFloat(validationPayload?.amount ?? amount ?? "0");
  if (!Number.isFinite(validatedAmount) || Math.abs(validatedAmount - expectedAmount) > 0.5) {
    console.error("[sslcommerz/callback] Amount mismatch", { expectedAmount, validatedAmount });
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const validatedCurrency = (validationPayload?.currency_type ?? validationPayload?.currency ?? currency ?? "").toString();
  if (validatedCurrency && validatedCurrency !== "BDT") {
    console.error("[sslcommerz/callback] Currency mismatch", { validatedCurrency });
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  try {
    const completionResponse = await fetch(new URL("/api/auth/signup/complete", request.nextUrl.origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        planSlug,
        billingEmail,
        paymentConfirmed: true,
        paymentReference: {
          provider: "SSLCOMMERZ",
          transactionId,
          validationId,
          amount: validatedAmount,
          currency: validatedCurrency || "BDT",
          cardType: validationPayload?.card_type?.toString() ?? undefined,
        },
      }),
      cache: "no-store",
    });

    if (!completionResponse.ok && completionResponse.status !== 410) {
      const payload = await completionResponse.json().catch(() => ({}));
      console.error("[sslcommerz/callback] Completion error", payload);
      const redirectUrl = buildRedirect(request, token, "error");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }
  } catch (error) {
    console.error("[sslcommerz/callback] Completion request failed", error);
    const redirectUrl = buildRedirect(request, token, "error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const redirectUrl = buildRedirect(request, token, "success");
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
