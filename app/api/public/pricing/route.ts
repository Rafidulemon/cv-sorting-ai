import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { creditBundles, creditUsageRows, freePlanNudge, pricingPlans } from "@/app/data/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [plans, creditUsage, nudge] = await Promise.all([
      prisma.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.creditUsage.findMany({ orderBy: { action: "asc" } }),
      prisma.freePlanNudge.findUnique({ where: { id: "default" } }),
    ]);

    const resolvedPlans = plans.length ? plans : pricingPlans;
    const resolvedBundles =
      resolvedPlans.find((plan: any) => Array.isArray((plan as any)?.creditBundles) && (plan as any).creditBundles.length)?.creditBundles ??
      creditBundles;

    return NextResponse.json({
      plans: resolvedPlans,
      creditUsage: creditUsage.length ? creditUsage : creditUsageRows,
      freePlanNudge: nudge ?? freePlanNudge,
      creditBundles: resolvedBundles,
    });
  } catch (error) {
    console.error("[pricing/public] Falling back to static pricing", error);
    return NextResponse.json({
      plans: pricingPlans,
      creditUsage: creditUsageRows,
      freePlanNudge,
      creditBundles,
    });
  }
}
