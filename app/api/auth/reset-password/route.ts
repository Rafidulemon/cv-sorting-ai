import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

const resetSchema = z.object({
  token: z.string().min(10, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function extractUserId(identifier: string) {
  return identifier.startsWith("password-reset:") ? identifier.replace("password-reset:", "") : null;
}

function maskEmail(email?: string | null) {
  if (!email) return null;
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const prefix = user.slice(0, 2) || "*";
  return `${prefix}${user.length > 2 ? "***" : ""}@${domain}`;
}

async function getValidResetContext(token: string) {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;

  const userId = extractUserId(record.identifier);
  if (!userId) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return null;
  }

  const now = new Date();
  if (record.expires < now) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return null;
  }

  return { userId, record };
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const context = await getValidResetContext(token);
  if (!context) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 410 });
  }

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
    select: { email: true, name: true },
  });

  if (!user) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: `password-reset:${context.userId}` },
    });
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    email: maskEmail(user.email),
    name: user.name ?? null,
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = resetSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { token, password } = parsed.data;

  try {
    const context = await getValidResetContext(token);
    if (!context) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 410 });
    }

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: `password-reset:${context.userId}` },
      });
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 410 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          emailVerified: user.emailVerified ?? new Date(),
        },
      });

      await tx.session.deleteMany({ where: { userId: user.id } });

      await tx.verificationToken.deleteMany({
        where: { identifier: `password-reset:${user.id}` },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset failed", error);
    const message = error instanceof Error ? error.message : "Unable to reset password right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
