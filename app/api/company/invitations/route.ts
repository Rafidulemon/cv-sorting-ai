import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";
import { assertMailerConfig, sendEmail } from "@/app/lib/mailer";
import { buildMemberInvitationEmail } from "@/app/lib/emailTemplates";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  emails: z.array(z.string().trim().email("Invite email is invalid")).min(1, "At least one email is required"),
  role: z.enum(["COMPANY_ADMIN", "COMPANY_MEMBER", "VIEWER"]).default("COMPANY_MEMBER"),
});

async function getContext(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  const userId = (token as any)?.id as string | undefined;
  const tokenOrgId = (token as any)?.organizationId as string | undefined;

  if (!userId) return { userId: null, organizationId: null, membershipRole: null };

  const membership = await prisma.membership.findFirst({
    where: tokenOrgId ? { userId, organizationId: tokenOrgId } : { userId },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true, role: true, userId: true },
  });

  return {
    userId,
    organizationId: tokenOrgId ?? membership?.organizationId ?? null,
    membershipRole: membership?.role ?? null,
  };
}

export async function POST(request: NextRequest) {
  try {
    assertMailerConfig();
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Email is not configured" }, { status: 500 });
  }

  const context = await getContext(request);
  if (!context.userId || !context.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (context.membershipRole !== "COMPANY_ADMIN") {
    return NextResponse.json({ error: "Only company admins can send invitations" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = inviteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invite details", details: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedEmails = Array.from(
    new Set(parsed.data.emails.map((email) => email.toLowerCase().trim()).filter((email) => email.length)),
  );

  if (!normalizedEmails.length) {
    return NextResponse.json({ error: "Please provide at least one valid email address" }, { status: 400 });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: context.organizationId },
    select: { id: true, name: true, seatLimit: true },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const memberCount = await prisma.membership.count({
    where: { organizationId: organization.id, status: { not: "DISABLED" } },
  });

  const pendingInvitesCount = await prisma.invitation.count({
    where: {
      organizationId: organization.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  const seatsRemaining =
    typeof organization.seatLimit === "number"
      ? Math.max(organization.seatLimit - memberCount - pendingInvitesCount, 0)
      : null;

  if (seatsRemaining !== null && seatsRemaining <= 0) {
    return NextResponse.json({ error: "All seats are already allocated for this plan." }, { status: 400 });
  }

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: normalizedEmails } },
    select: {
      email: true,
      memberships: { where: { organizationId: organization.id }, select: { id: true } },
    },
  });

  const existingMemberEmails = new Set(
    existingUsers.filter((user) => user.memberships.length > 0).map((user) => user.email?.toLowerCase() ?? ""),
  );

  const existingInvites = await prisma.invitation.findMany({
    where: {
      organizationId: organization.id,
      email: { in: normalizedEmails },
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { email: true },
  });

  const existingInviteEmails = new Set(existingInvites.map((invite) => invite.email.toLowerCase()));

  const emailsToInvite = normalizedEmails.filter(
    (email) => !existingMemberEmails.has(email) && !existingInviteEmails.has(email),
  );

  if (!emailsToInvite.length) {
    return NextResponse.json({ error: "All provided emails are already invited or members of this workspace." }, { status: 400 });
  }

  if (seatsRemaining !== null && emailsToInvite.length > seatsRemaining) {
    return NextResponse.json(
      { error: `Only ${seatsRemaining} seats are available for this plan. Reduce the invite list.` },
      { status: 400 },
    );
  }

  const inviter = await prisma.user.findUnique({ where: { id: context.userId }, select: { name: true } });
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invites = await prisma.$transaction(async (tx) => {
    const records = [];
    for (const email of emailsToInvite) {
      const record = await tx.invitation.create({
        data: {
          organizationId: organization.id,
          email,
          role: parsed.data.role,
          token: crypto.randomBytes(24).toString("hex"),
          invitedById: context.userId,
          expiresAt: inviteExpiresAt,
        },
      });
      records.push(record);
    }
    return records;
  });

  const invitePromises = invites.map((invite) => {
    const inviteUrl = new URL("/auth/invite", request.nextUrl.origin);
    inviteUrl.searchParams.set("token", invite.token);

    const emailContent = buildMemberInvitationEmail({
      inviteeEmail: invite.email,
      inviterName: inviter?.name ?? null,
      organizationName: organization.name,
      role: invite.role,
      inviteUrl: inviteUrl.toString(),
      expiresAt: invite.expiresAt,
    });

    return sendEmail({
      to: invite.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  });

  try {
    await Promise.all(invitePromises);
  } catch (error) {
    console.error("[company/invitations] Failed to send some invites", error);
  }

  const remainingAfter =
    seatsRemaining !== null ? Math.max(seatsRemaining - invites.length, 0) : seatsRemaining ?? undefined;

  return NextResponse.json({
    success: true,
    sent: invites.length,
    seatsRemaining: remainingAfter,
  });
}
