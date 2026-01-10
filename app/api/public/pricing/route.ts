import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { creditUsageRows, freePlanNudge, pricingPlans } from "@/app/data/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
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
    console.error("[pricing/public] Falling back to static pricing", error);
    return NextResponse.json({
      plans: pricingPlans,
      creditUsage: creditUsageRows,
      freePlanNudge,
    });
  }
}
