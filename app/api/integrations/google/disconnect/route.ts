import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  const userId = token?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { connectedEmail: null },
    });
    return NextResponse.json({ status: "disconnected" });
  } catch (error) {
    console.error("Failed to disconnect Gmail", error);
    return NextResponse.json({ error: "Failed to disconnect Gmail" }, { status: 500 });
  }
}
