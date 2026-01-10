import {
  creditUsageRows,
  freePlanNudge,
  pricingPlans,
  type CreditUsageRow,
  type FreePlanNudge,
  type PricingPlan,
} from "@/app/data/pricing";
import prisma from "@/app/lib/prisma";

const FALLBACK = {
  plans: pricingPlans,
  creditUsage: creditUsageRows,
  freePlanNudge,
};

type PricingData = {
  plans: PricingPlan[];
  creditUsage: CreditUsageRow[];
  freePlanNudge: FreePlanNudge;
};

export async function getPricingData(): Promise<PricingData> {
  try {
    const [plans, creditUsage, nudge] = await Promise.all([
      prisma.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.creditUsage.findMany({ orderBy: { action: "asc" } }),
      prisma.freePlanNudge.findUnique({ where: { id: "default" } }),
    ]);

    return {
      plans: plans.length ? plans : FALLBACK.plans,
      creditUsage: creditUsage.length ? creditUsage : FALLBACK.creditUsage,
      freePlanNudge: nudge ?? FALLBACK.freePlanNudge,
    };
  } catch (error) {
    console.warn("[pricing] falling back to local data", error);
    return FALLBACK;
  }
}
