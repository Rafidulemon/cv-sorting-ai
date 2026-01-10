import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const CLIENT_ROUTE_PREFIXES = [
  "/dashboard",
  "/jobs",
  "/results",
  "/history",
  "/credits",
  "/integrations",
  "/company",
  "/cv",
  "/settings",
  "/profile",
];
const ADMIN_PREFIX = "/admin";
const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

export async function proxy(req: NextRequest) {
  const isSecure = req.nextUrl.protocol === "https:";
  const token = await getToken({
    req,
    secret: authSecret,
    // NextAuth v5 sets a __Secure- prefix on HTTPS, so we need to tell getToken
    // to look for the secure cookie in production; otherwise it misses the session.
    secureCookie: isSecure,
  });
  const pathname = req.nextUrl.pathname;

  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isClientRoute = CLIENT_ROUTE_PREFIXES.some((route) => pathname.startsWith(route));
  const role = (token as any)?.role as string | undefined;

  if (!token && (isClientRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }

  if (token && isAuthRoute) {
    const target = role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, req.nextUrl));
  }

  if (token && isAdminRoute && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (token && isClientRoute && role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo|.*\\..*).*)"],
};
