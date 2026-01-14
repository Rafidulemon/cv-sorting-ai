import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import prisma from "@/app/lib/prisma";
import { assertMailerConfig, sendEmail } from "@/app/lib/mailer";
import { buildPasswordResetEmail } from "@/app/lib/emailTemplates";

export const dynamic = "force-dynamic";

const forgotSchema = z.object({
  email: z.string().trim().email("A valid email is required").max(180),
});

function normalizeEmail(value: string) {
  return value.toLowerCase().trim();
}

function resolveBaseUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configured?.length) {
    return configured.replace(/\/+$/, "");
  }
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  try {
    assertMailerConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email is not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = forgotSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!user?.id || !user.email) {
    // Avoid account enumeration by returning success even when the user isn't found.
    return NextResponse.json({ success: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({
      where: { identifier: `password-reset:${user.id}` },
    });

    await tx.verificationToken.create({
      data: {
        identifier: `password-reset:${user.id}`,
        token,
        expires: expiresAt,
      },
    });
  });

  const baseUrl = resolveBaseUrl(request);
  const resetUrl = new URL("/auth/reset-password", baseUrl);
  resetUrl.searchParams.set("token", token);

  const emailContent = buildPasswordResetEmail({
    name: user.name,
    resetUrl: resetUrl.toString(),
    expiresAt,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  } catch (error) {
    console.error("Failed to send password reset email", error);
    return NextResponse.json({ error: "Unable to send reset email right now." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
