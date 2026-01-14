import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import crypto from "crypto";
import { MembershipStatus, UserRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { assertMailerConfig, sendEmail } from "@/app/lib/mailer";
import { buildMemberInvitationEmail } from "@/app/lib/emailTemplates";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  emails: z.array(z.string().trim().email("Invite email is invalid")).min(1, "At least one email is required"),
  role: z.enum(["COMPANY_ADMIN", "COMPANY_MEMBER", "VIEWER"]).default("COMPANY_MEMBER"),
  note: z.string().trim().max(500).optional(),
  name: z.string().trim().min(2, "Name is required").max(140),
  designation: z.string().trim().max(140).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultOrgId: true, role: true },
  });

  return {
    userId,
    organizationId: tokenOrgId ?? user?.defaultOrgId ?? null,
    membershipRole: user?.role ?? null,
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
  if (parsed.data.emails.length > 1) {
    return NextResponse.json({ error: "You can invite only one teammate at a time." }, { status: 400 });
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

  const memberCount = await prisma.user.count({
    where: { defaultOrgId: organization.id, profileStatus: { not: "DISABLED" as any } },
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
      defaultOrgId: true,
      id: true,
      role: true,
      profileStatus: true,
    },
  });

  const existingMemberEmails = new Set(
    existingUsers
      .filter((user) => user.defaultOrgId === organization.id)
      .map((user) => user.email?.toLowerCase() ?? ""),
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
  const skippedEmails = normalizedEmails.filter((email) => !emailsToInvite.includes(email));

  if (!emailsToInvite.length) {
    return NextResponse.json({ error: "Provided email is already invited or members of carriX." }, { status: 400 });
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
      const existingUser = existingUsers.find((user) => user.email?.toLowerCase() === email);

      if (existingUser && existingUser.defaultOrgId && existingUser.defaultOrgId !== organization.id) {
        throw new Error("This user already belongs to another workspace. Please use a different email.");
      }

      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            email,
            name: parsed.data.name.trim(),
            designation: parsed.data.designation?.trim() || null,
            phone: parsed.data.phone?.trim() || null,
            role: parsed.data.role as UserRole,
            profileStatus: MembershipStatus.PENDING,
            defaultOrgId: organization.id,
          },
        }));

      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: parsed.data.name.trim(),
            designation: parsed.data.designation?.trim() || null,
            phone: parsed.data.phone?.trim() || null,
            role: parsed.data.role as UserRole,
            profileStatus: MembershipStatus.PENDING,
            defaultOrgId: organization.id,
          },
        });
      }

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
      note: parsed.data.note?.trim() || "",
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
    skipped: skippedEmails,
  });
}
