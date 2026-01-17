import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

type AuthToken = {
  id?: string;
  organizationId?: string;
};

async function getSessionContext(request: NextRequest) {
  const token = (await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  })) as AuthToken | null;

  const userId = token?.id;
  const tokenOrgId = token?.organizationId;

  if (!userId) {
    return { userId: null, organizationId: null };
  }

  const orgId =
    tokenOrgId ??
    (
      await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultOrgId: true },
      })
    )?.defaultOrgId ??
    null;

  return { userId, organizationId: orgId };
}

export async function GET(request: NextRequest) {
  try {
    const context = await getSessionContext(request);
    if (!context.userId || !context.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidates = await prisma.candidate.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        location: true,
        headline: true,
        source: true,
        createdAt: true,
        tags: true,
      },
      take: 15,
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("[candidates] Failed to load candidates", error);
    const message = error instanceof Error ? error.message : "Failed to load candidates";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
