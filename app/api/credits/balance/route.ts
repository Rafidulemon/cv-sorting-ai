import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

function mapPlanSlug(planTier?: string | null) {
  if (!planTier) return null;
  const normalized = planTier.toLowerCase();
  if (normalized === "freemium") return "free";
  if (normalized === "standard") return "standard";
  return "premium";
}

export const dynamic = "force-dynamic";
const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: authSecret, secureCookie: request.nextUrl.protocol === "https:" });
  const userId = (token as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({
      remaining: 0,
      total: 0,
      plan: null,
      planTier: null,
      renewsOn: null,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      defaultOrgId: true,
    },
  });

  const orgId = user?.defaultOrgId ?? null;
  if (!orgId) {
    return NextResponse.json(
      { remaining: 0, total: 0, plan: "No org", planTier: null, renewsOn: null },
      { status: 200 },
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      planSlug: true,
      planTier: true,
      creditsBalance: true,
      resumeAllotment: true,
      renewsOn: true,
    },
  });

  const planSlug = organization?.planSlug ?? mapPlanSlug(organization?.planTier) ?? "free";
  const pricingPlan = planSlug
    ? await prisma.pricingPlan.findUnique({ where: { slug: planSlug } })
    : null;

  const total = pricingPlan?.monthlyCredits ?? organization?.resumeAllotment ?? 0;
  const remaining = organization?.creditsBalance ?? total ?? 0;
  const used = Math.max(0, total - remaining);
  const planName = pricingPlan?.name ?? organization?.planTier ?? "Plan";
  const renewsOn = organization?.renewsOn ?? null;

  return NextResponse.json({
    remaining,
    total,
    used,
    plan: planName,
    planTier: organization?.planTier ?? null,
    renewsOn,
  });
}
