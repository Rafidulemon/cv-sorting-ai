import {
  creditBundles,
  creditUsageRows,
  freePlanNudge,
  pricingPlans,
  type CreditBundle,
  type CreditUsageRow,
  type FreePlanNudge,
  type PricingPlan,
} from "@/app/data/pricing";
import prisma from "@/app/lib/prisma";

const FALLBACK = {
  plans: pricingPlans,
  creditUsage: creditUsageRows,
  freePlanNudge,
  creditBundles,
};

type PricingData = {
  plans: PricingPlan[];
  creditUsage: CreditUsageRow[];
  freePlanNudge: FreePlanNudge;
  creditBundles: CreditBundle[];
};

const normalizeBundles = (value: any): CreditBundle[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item && typeof item === "object" ? item : null))
    .filter(Boolean)
    .map((item: any) => ({
      id: typeof item.id === "string" ? item.id : undefined,
      name: typeof item.name === "string" ? item.name : "",
      credits: typeof item.credits === "number" ? item.credits : Number(item.credits) || 0,
      isPopular: Boolean(item.isPopular),
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : undefined,
    }))
    .filter((item) => item.name && item.credits > 0);
};

const normalizePlans = (plans: any[]): PricingPlan[] =>
  plans.map((plan) => ({
    ...(plan as any),
    creditBundles: normalizeBundles((plan as any)?.creditBundles),
  }));

export async function getPricingData(): Promise<PricingData> {
  try {
    const [plans, creditUsage, nudge] = await Promise.all([
      prisma.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.creditUsage.findMany({ orderBy: { action: "asc" } }),
      prisma.freePlanNudge.findUnique({ where: { id: "default" } }),
    ]);

    const resolvedPlans = plans.length ? normalizePlans(plans) : FALLBACK.plans;
    const resolvedBundles =
      resolvedPlans.find((plan: any) => Array.isArray((plan as any)?.creditBundles) && (plan as any).creditBundles.length)?.creditBundles ??
      FALLBACK.creditBundles;

    return {
      plans: resolvedPlans,
      creditUsage: creditUsage.length ? creditUsage : FALLBACK.creditUsage,
      freePlanNudge: nudge ?? FALLBACK.freePlanNudge,
      creditBundles: resolvedBundles,
    };
  } catch (error) {
    console.warn("[pricing] falling back to local data", error);
    return FALLBACK;
  }
}
