import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<Record<string, never>> };

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").optional(),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password is too long"),
});

const handler = auth(async (request) => {
  const userId = (request.auth?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hasExistingPassword = Boolean(user.passwordHash);

  if (hasExistingPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash!);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashed },
  });

  return NextResponse.json({ success: true });
});

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return handler(request, { params });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return handler(request, { params });
}
