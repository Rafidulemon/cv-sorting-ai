import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  const userId = (token as any)?.id as string | undefined;
  const role = (token as any)?.role as string | undefined;
  if (!userId || role !== "COMPANY_ADMIN") {
    return NextResponse.json({ entries: [], topUpRate: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultOrgId: true },
  });

  const orgId = user?.defaultOrgId;
  if (!orgId) {
    return NextResponse.json({ entries: [], topUpRate: null }, { status: 200 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      planSlug: true,
      plan: {
        select: { slug: true, topUp: true, price: true, name: true },
      },
      creditLedger: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          referenceId: true,
          referenceType: true,
          createdAt: true,
        },
      },
    },
  });

  const plan = organization?.plan;
  const topUpRate = typeof plan?.topUp === "number" ? plan.topUp : null;
  const planPrice = typeof plan?.price === "number" ? plan.price : null;

  const entries = (organization?.creditLedger ?? []).map((entry) => {
    const referenceType = (entry.referenceType ?? "").toLowerCase();
    const isSslCommerz = referenceType === "sslcommerz";

    return {
      id: entry.id,
      credits: entry.amount,
      type: entry.type,
      description: entry.description ?? null,
      referenceId: entry.referenceId ?? null,
      referenceType: entry.referenceType ?? null,
      createdAt: entry.createdAt,
      estimatedBdt:
        entry.type === "PURCHASE" && topUpRate && entry.amount > 0
          ? Math.round((entry.amount / 100) * topUpRate)
          : entry.type === "ALLOTMENT" && isSslCommerz && planPrice
            ? planPrice
            : null,
    };
  });

  return NextResponse.json({ entries, topUpRate });
}
