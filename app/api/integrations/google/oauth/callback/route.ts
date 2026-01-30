import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/app/lib/prisma";

const clientId = process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ??
  process.env.GOOGLE_REDIRECT_URI ??
  "http://localhost:3000/api/integrations/google/oauth/callback";
const authSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: authSecret,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  const userIdFromSession = (token?.id as string | undefined) ?? null;
  const stateParam = request.nextUrl.searchParams.get("state");
  const userIdFromState = stateParam?.startsWith("uid:") ? stateParam.slice(4) : null;
  const userId = userIdFromSession ?? userIdFromState;
  if (!userId) {
    const loginRedirect = new URL("/auth/login", request.url);
    loginRedirect.searchParams.set("redirect", "/integrations");
    loginRedirect.searchParams.set("error", "signin_required");
    return NextResponse.redirect(loginRedirect.toString());
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Google OAuth client is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const body = (await tokenRes.json()) as Record<string, unknown>;

    if (!tokenRes.ok) {
      return NextResponse.json({ error: "Token exchange failed", details: body }, { status: 400 });
    }

    // Fetch Gmail profile to resolve the connected email address
  const profileRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${body.access_token}` },
  });
  const profileJson = (await profileRes.json()) as { emailAddress?: string };
  const connectedEmail = profileJson?.emailAddress ?? null;

  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const loginEmail = userRecord?.email ?? null;

  // Enforce that the Gmail account matches the logged-in user email
  if (connectedEmail && loginEmail && connectedEmail.toLowerCase() !== loginEmail.toLowerCase()) {
    const redirect = new URL("/integrations", request.url);
    redirect.searchParams.set("provider", "google");
    redirect.searchParams.set("status", "email_mismatch");
    redirect.searchParams.set("connected", connectedEmail);
    redirect.searchParams.set("login", loginEmail);
    return NextResponse.redirect(redirect.toString());
  }

  // Persist connected email (and optionally refresh token if you choose)
  await prisma.user.update({
    where: { id: userId },
    data: {
      connectedEmail,
    },
  });

    // For now, just redirect back to the integrations page without exposing tokens in the browser.
    const redirect = new URL("/integrations", request.url);
    redirect.searchParams.set("provider", "google");
    redirect.searchParams.set("status", tokenRes.ok ? "success" : "error");
    redirect.searchParams.set("scope", Array.isArray(scope) ? scope.join(" ") : `${scope ?? ""}`);
    return NextResponse.redirect(redirect.toString());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error exchanging code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
