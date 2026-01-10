import { NextResponse, type NextRequest } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";
import { z } from "zod";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

async function getSessionContext(request: NextRequest) {
  const token = (await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  })) as (JWT & { id?: string; organizationId?: string }) | null;

  const userId = token?.id;
  const tokenOrgId = token?.organizationId;

  if (!userId) {
    return { userId: null, organizationId: null };
  }

  const membership = await prisma.membership.findFirst({
    where: tokenOrgId ? { userId, organizationId: tokenOrgId } : { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, organizationId: true, role: true, userId: true },
  });

  return {
    userId,
    organizationId: tokenOrgId ?? membership?.organizationId ?? null,
    membershipRole: membership?.role ?? null,
    membershipId: membership?.id ?? null,
  };
}

export async function GET(request: NextRequest) {
  const context = await getSessionContext(request);

  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: context.userId, organizationId: context.organizationId },
    select: { organizationId: true, role: true, userId: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const organization = await prisma.organization.findUnique({
    where: { id: membership.organizationId },
    select: { ownerId: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const actorIsOwner = organization.ownerId === membership.userId;

  if (membership.role !== "COMPANY_ADMIN" && !actorIsOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.membership.findMany({
    where: { organizationId: membership.organizationId },
    select: {
      id: true,
      role: true,
      status: true,
      createdAt: true,
      lastActiveAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    ownerId: organization.ownerId,
    members: members.map((member) => ({
      id: member.id,
      role: member.role,
      status: member.status,
      createdAt: member.createdAt,
      lastActiveAt: member.lastActiveAt,
      user: member.user,
    })),
  });
}

const roleUpdateSchema = z.object({
  memberId: z.string().trim().min(1, "Member ID is required"),
  role: z.enum(["COMPANY_ADMIN", "COMPANY_MEMBER", "VIEWER"]),
});

export async function PATCH(request: NextRequest) {
  const context = await getSessionContext(request);

  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: context.userId, organizationId: context.organizationId },
    select: { id: true, role: true, organizationId: true, userId: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: membership.organizationId },
    select: { ownerId: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const actorIsOwner = organization.ownerId === membership.userId;

  if (membership.role !== "COMPANY_ADMIN" && !actorIsOwner) {
    return NextResponse.json({ error: "Only company owners or admins can update member roles" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = roleUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const targetMembership = await prisma.membership.findUnique({
    where: { id: parsed.data.memberId },
    select: {
      id: true,
      role: true,
      status: true,
      organizationId: true,
      userId: true,
      createdAt: true,
      lastActiveAt: true,
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  if (!targetMembership || targetMembership.organizationId !== membership.organizationId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const targetIsOwner = targetMembership.userId === organization.ownerId;

  if (targetIsOwner && !actorIsOwner) {
    return NextResponse.json({ error: "Only another owner can change an owner's role" }, { status: 403 });
  }

  if (targetIsOwner && targetMembership.userId === membership.userId) {
    return NextResponse.json({ error: "Owners cannot change their own role" }, { status: 403 });
  }

  const updated = await prisma.membership.update({
    where: { id: targetMembership.id },
    data: { role: parsed.data.role },
    select: {
      id: true,
      role: true,
      status: true,
      createdAt: true,
      lastActiveAt: true,
      organizationId: true,
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return NextResponse.json({
    member: {
      id: updated.id,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt,
      lastActiveAt: updated.lastActiveAt,
      user: updated.user,
    },
    ownerId: organization.ownerId,
  });
}
