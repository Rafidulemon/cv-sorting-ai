import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { pricingPlans, creditUsageRows, freePlanNudge, type PricingPlan, type CreditUsageRow, type FreePlanNudge } from "@/app/data/pricing";

type AdminPricingPayload = {
  plans: PricingPlan[];
  creditUsage: CreditUsageRow[];
  freePlanNudge: FreePlanNudge;
};

const parseTeamCount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/(\d+)/);
    if (match) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
};

function ensureSuperAdmin(session: any) {
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const session = await auth(request as any);
  const forbidden = ensureSuperAdmin(session);
  if (forbidden) return forbidden;

  try {
    const [plans, creditUsage, nudge] = await Promise.all([
      prisma.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.creditUsage.findMany({ orderBy: { action: "asc" } }),
      prisma.freePlanNudge.findUnique({ where: { id: "default" } }),
    ]);

    return NextResponse.json({
      plans: plans.length ? plans : pricingPlans,
      creditUsage: creditUsage.length ? creditUsage : creditUsageRows,
      freePlanNudge: nudge ?? freePlanNudge,
    });
  } catch (error) {
    console.error("[pricing/admin] get failed", error);
    return NextResponse.json({ error: "Failed to load pricing" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth(request as any);
  const forbidden = ensureSuperAdmin(session);
  if (forbidden) return forbidden;

  let payload: AdminPricingPayload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(payload.plans) || !Array.isArray(payload.creditUsage) || !payload.freePlanNudge) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const plans = payload.plans;
  const creditUsage = payload.creditUsage;
  const nudge = payload.freePlanNudge;

  try {
    await prisma.$transaction([
      prisma.pricingPlan.deleteMany({ where: { slug: { notIn: plans.map((plan) => plan.slug) } } }),
      prisma.creditUsage.deleteMany({ where: { action: { notIn: creditUsage.map((item) => item.action) } } }),
    ]);

    for (const [index, plan] of plans.entries()) {
      await prisma.pricingPlan.upsert({
        where: { slug: plan.slug },
        update: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          period: plan.period,
          cta: plan.cta,
          highlight: Boolean(plan.highlight),
          features: plan.features,
          topUp: plan.topUp,
          monthlyCredits: plan.monthlyCredits,
          approxCvs: plan.approxCvs,
          activeJobs: plan.activeJobs,
          team: parseTeamCount(plan.team),
          support: plan.support,
          apiAccess: plan.apiAccess,
          askAi: plan.askAi,
          aiJd: plan.aiJd,
          ocr: plan.ocr,
          semanticSearch: plan.semanticSearch,
          sortOrder: index,
          creditBundles: plan.creditBundles ?? [],
        },
        create: {
          slug: plan.slug,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          period: plan.period,
          cta: plan.cta,
          highlight: Boolean(plan.highlight),
          features: plan.features,
          topUp: plan.topUp,
          monthlyCredits: plan.monthlyCredits,
          approxCvs: plan.approxCvs,
          activeJobs: plan.activeJobs,
          team: parseTeamCount(plan.team),
          support: plan.support,
          apiAccess: plan.apiAccess,
          askAi: plan.askAi,
          aiJd: plan.aiJd,
          ocr: plan.ocr,
          semanticSearch: plan.semanticSearch,
          sortOrder: index,
          creditBundles: plan.creditBundles ?? [],
        },
      });
    }

    for (const row of creditUsage) {
      await prisma.creditUsage.upsert({
        where: { action: row.action },
        update: { credits: row.credits },
        create: { action: row.action, credits: row.credits },
      });
    }

    await prisma.freePlanNudge.upsert({
      where: { id: "default" },
      update: {
        headline: nudge.headline,
        bullets: nudge.bullets,
        banner: nudge.banner,
      },
      create: {
        id: "default",
        headline: nudge.headline,
        bullets: nudge.bullets,
        banner: nudge.banner,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[pricing/admin] put failed", error);
    return NextResponse.json({ error: "Failed to save pricing" }, { status: 500 });
  }
}
