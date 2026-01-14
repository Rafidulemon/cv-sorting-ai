import { NextResponse, type NextRequest } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";
import { z } from "zod";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

function buildPublicUrlFromKey(key?: string | null) {
  const trimmed = key?.trim();
  if (!trimmed?.length) return null;
  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  const publicBase = (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  return publicBase ? `${publicBase}/${trimmed}` : trimmed;
}

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

  return {
    userId,
    organizationId:
      tokenOrgId ??
      (
        await prisma.user.findUnique({
          where: { id: userId },
          select: { defaultOrgId: true, role: true },
        })
      )?.defaultOrgId ??
      null,
    membershipRole:
      (
        await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        })
      )?.role ?? null,
    membershipId: null,
  };
}

export async function GET(request: NextRequest) {
  const context = await getSessionContext(request);

  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: context.organizationId },
    select: { ownerId: true, id: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const actorIsOwner = organization.ownerId === context.userId;

  if (context.membershipRole !== "COMPANY_ADMIN" && context.membershipRole !== "SUPER_ADMIN" && !actorIsOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.user.findMany({
    where: { defaultOrgId: organization.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      profileStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const pendingInvites = await prisma.invitation.count({
    where: {
      organizationId: organization.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  return NextResponse.json({
    ownerId: organization.ownerId,
    pendingInviteCount: pendingInvites,
    members: members.map((member) => ({
      id: member.id,
      role: member.role,
      status: member.profileStatus ?? "ACTIVE",
      createdAt: member.createdAt,
      lastActiveAt: member.lastLoginAt,
      user: {
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
        imageUrl: buildPublicUrlFromKey(member.image),
      },
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

  const organization = await prisma.organization.findUnique({
    where: { id: context.organizationId },
    select: { ownerId: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const actorIsOwner = organization.ownerId === context.userId;

  if (context.membershipRole !== "COMPANY_ADMIN" && context.membershipRole !== "SUPER_ADMIN" && !actorIsOwner) {
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

  const targetUser = await prisma.user.findUnique({
    where: { id: parsed.data.memberId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      profileStatus: true,
      defaultOrgId: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!targetUser || targetUser.defaultOrgId !== context.organizationId) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const targetIsOwner = targetUser.id === organization.ownerId;

  if (targetIsOwner && !actorIsOwner) {
    return NextResponse.json({ error: "Only another owner can change an owner's role" }, { status: 403 });
  }

  if (targetIsOwner && targetUser.id === context.userId) {
    return NextResponse.json({ error: "Owners cannot change their own role" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id: targetUser.id },
    data: { role: parsed.data.role },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      profileStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return NextResponse.json({
    member: {
      id: updated.id,
      role: updated.role,
      status: updated.profileStatus ?? "ACTIVE",
      createdAt: updated.createdAt,
      lastActiveAt: updated.lastLoginAt,
      user: { id: updated.id, name: updated.name, email: updated.email, image: updated.image },
    },
    ownerId: organization.ownerId,
  });
}
