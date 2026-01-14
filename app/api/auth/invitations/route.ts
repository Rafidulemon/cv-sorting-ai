import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/mailer";
import { buildSignupCompleteEmail } from "@/app/lib/emailTemplates";

export const dynamic = "force-dynamic";

const acceptSchema = z.object({
  token: z.string().min(10, "Invitation token is required"),
  name: z.string().trim().min(2, "Name is required").max(140),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  designation: z.string().trim().max(140).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

async function getInvitationWithContext(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          seatLimit: true,
          website: true,
          domain: true,
          phone: true,
          size: true,
          companyEmail: true,
        },
      },
      invitedBy: { select: { name: true } },
    },
  });

  if (!invitation) return null;

  const existingUser = await prisma.user.findFirst({
    where: {
      email: invitation.email.toLowerCase(),
      defaultOrgId: invitation.organizationId,
    },
    select: { name: true },
  });

  const memberCount = await prisma.user.count({
    where: { defaultOrgId: invitation.organizationId, profileStatus: { not: "DISABLED" as any } },
  });

  const pendingInvitesCount = await prisma.invitation.count({
    where: {
      organizationId: invitation.organizationId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
      token: { not: token },
    },
  });

  const seatsRemaining =
    typeof invitation.organization.seatLimit === "number"
      ? Math.max(invitation.organization.seatLimit - memberCount - pendingInvitesCount, 0)
      : null;

  return { invitation, seatsRemaining, memberCount, pendingInvitesCount, inviteeName: existingUser?.name ?? null };
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const data = await getInvitationWithContext(token);
  if (!data) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const { invitation, seatsRemaining, inviteeName } = data;
  const now = new Date();

  if (invitation.acceptedAt) {
    return NextResponse.json({ error: "This invitation has already been used." }, { status: 410 });
  }

  if (invitation.expiresAt < now) {
    return NextResponse.json({ error: "This invitation has expired." }, { status: 410 });
  }

  if (seatsRemaining !== null && seatsRemaining <= 0) {
    return NextResponse.json(
      { error: "No seats are available for this workspace. Please contact the workspace owner." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    invitation: {
      email: invitation.email,
      role: invitation.role,
      organizationName: invitation.organization.name,
      organization: {
        name: invitation.organization.name,
        website: invitation.organization.website,
        domain: invitation.organization.domain,
        phone: invitation.organization.phone,
        size: invitation.organization.size,
        companyEmail: invitation.organization.companyEmail,
      },
      inviterName: invitation.invitedBy?.name ?? null,
      expiresAt: invitation.expiresAt.toISOString(),
      name: inviteeName ?? "",
      seatsRemaining,
    },
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = acceptSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid details", details: parsed.error.flatten() }, { status: 400 });
  }

  const { token, name, password, designation, phone } = parsed.data;
  const data = await getInvitationWithContext(token);

  if (!data) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const { invitation, seatsRemaining } = data;
  const now = new Date();

  if (invitation.acceptedAt) {
    return NextResponse.json({ error: "This invitation has already been used." }, { status: 410 });
  }

  if (invitation.expiresAt < now) {
    return NextResponse.json({ error: "This invitation has expired." }, { status: 410 });
  }

  if (seatsRemaining !== null && seatsRemaining <= 0) {
    return NextResponse.json(
      { error: "No seats are available for this workspace. Please contact the workspace owner." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      defaultOrgId: true,
      role: true,
      profileStatus: true,
      name: true,
      designation: true,
      phone: true,
    },
  });

  if (existingUser && existingUser.defaultOrgId && existingUser.defaultOrgId !== invitation.organizationId) {
    return NextResponse.json(
      { error: "This user already belongs to another workspace. Please contact support to switch." },
      { status: 409 },
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const user =
      existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name,
              passwordHash,
              emailVerified: new Date(),
              defaultOrgId: existingUser.defaultOrgId ?? invitation.organizationId,
              role: invitation.role,
              profileStatus: "ACTIVE",
              designation: designation?.trim() || existingUser.designation || null,
              phone: phone?.trim() || existingUser.phone || null,
              startedAt: new Date(),
            },
          })
        : await tx.user.create({
            data: {
              name,
              email: invitation.email.toLowerCase(),
              passwordHash,
              emailVerified: new Date(),
              defaultOrgId: invitation.organizationId,
              role: invitation.role,
              profileStatus: "ACTIVE",
              designation: designation?.trim() || null,
              phone: phone?.trim() || null,
              startedAt: new Date(),
            },
          });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    if (!user.defaultOrgId) {
      await tx.user.update({
        where: { id: user.id },
        data: { defaultOrgId: invitation.organizationId },
      });
    }

    return { user };
  });

  try {
    const dashboardUrl = new URL("/dashboard", request.nextUrl.origin).toString();
    const welcomeEmail = buildSignupCompleteEmail({
      name,
      companyName: invitation.organization.name,
      dashboardUrl,
    });

    await sendEmail({
      to: invitation.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      text: welcomeEmail.text,
    });
  } catch (error) {
    console.error("[auth/invitations] Failed to send welcome email", error);
  }

  return NextResponse.json({
    success: true,
    organization: {
      id: invitation.organizationId,
      name: invitation.organization.name,
    },
    memberId: result.user.id,
  });
}
