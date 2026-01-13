import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { assertMailerConfig, sendEmail } from "@/app/lib/mailer";
import { buildSignupConfirmationEmail } from "@/app/lib/emailTemplates";

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(140),
  email: z.string().trim().email("A valid work email is required").max(180),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  companyName: z.string().trim().min(2, "Company name is required").max(180),
  role: z.string().trim().max(140).optional().or(z.literal("")),
  teamSize: z.string().trim().max(80).optional().or(z.literal("")),
  preferredPlan: z.string().trim().max(80).optional().or(z.literal("")),
});

function normalizeEmail(value: string) {
  return value.toLowerCase().trim();
}

export async function POST(request: NextRequest) {
  try {
    assertMailerConfig();
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Email is not configured" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const email = normalizeEmail(data.email);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 hours
  const token = crypto.randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Clean up stale, incomplete attempts for the same email.
  await prisma.signupRequest.deleteMany({
    where: {
      email,
      status: { in: ["PENDING", "EMAIL_SENT"] },
      completedAt: null,
    },
  });

  const signupRequest = await prisma.signupRequest.create({
    data: {
      email,
      name: data.name.trim(),
      companyName: data.companyName.trim(),
      passwordHash,
      role: data.role?.trim() || null,
      teamSize: data.teamSize?.trim() || null,
      planSlug: data.preferredPlan?.trim() || null,
      billingEmail: email,
      status: "PENDING",
      token,
      expiresAt,
    },
  });

  const confirmUrl = new URL("/auth/signup/confirm", request.nextUrl.origin);
  confirmUrl.searchParams.set("token", token);

  const emailContent = buildSignupConfirmationEmail({
    name: data.name,
    companyName: data.companyName,
    confirmUrl: confirmUrl.toString(),
    expiresAt,
  });

  try {
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    await prisma.signupRequest.update({
      where: { id: signupRequest.id },
      data: { status: "EMAIL_SENT" },
    });
  } catch (error) {
    console.error("[auth/signup] Failed to send confirmation email", error);
    return NextResponse.json({ error: "Unable to send confirmation email right now. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Confirmation email sent. Please check your inbox to continue.",
    expiresAt,
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const signupRequest = await prisma.signupRequest.findUnique({ where: { token } });
  if (!signupRequest) {
    return NextResponse.json({ error: "Signup request not found" }, { status: 404 });
  }

  const now = new Date();
  if (signupRequest.status === "COMPLETED") {
    return NextResponse.json({ error: "This signup has already been completed." }, { status: 410 });
  }

  if (signupRequest.expiresAt < now) {
    await prisma.signupRequest.update({
      where: { id: signupRequest.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "This confirmation link has expired." }, { status: 410 });
  }

  return NextResponse.json({
    signup: {
      name: signupRequest.name,
      email: signupRequest.email,
      companyName: signupRequest.companyName,
      role: signupRequest.role ?? "",
      teamSize: signupRequest.teamSize ?? "",
      planSlug: signupRequest.planSlug ?? "standard",
      billingEmail: signupRequest.billingEmail ?? signupRequest.email,
      status: signupRequest.status,
      expiresAt: signupRequest.expiresAt.toISOString(),
    },
  });
}
