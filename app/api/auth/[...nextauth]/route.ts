import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/app/lib/prisma";

const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";

const providers: Provider[] = [
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "").toLowerCase().trim();
      const password = String(credentials?.password ?? "");

      if (!email || !password) return null;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, passwordHash: true, image: true },
      });

      if (!user?.passwordHash) return null;

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return null;

      const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { role: true, organizationId: true },
      });

      return {
        id: user.id,
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        role: membership?.role ?? null,
        organizationId: membership?.organizationId ?? null,
      };
    },
  }) as Provider,
];

export const authConfig: NextAuthConfig = {
  secret: nextAuthSecret,
  trustHost: true,
  session: { strategy: "jwt" as const },
  providers,
  callbacks: {
    async jwt({ token, account, profile, user }: any) {
      if (account) {
        (token as any).provider = account.provider;
        (token as any).accessToken = (account as any).access_token;
      }
      if (profile?.picture) (token as any).picture = profile.picture;
      if ((user as any)?.image) (token as any).picture = (user as any).image;
      if (user?.email) (token as any).email = user.email;
      if (user?.id) (token as any).id = user.id;
      if ((user as any)?.role) (token as any).role = (user as any).role;
      if ((user as any)?.organizationId) {
        (token as any).organizationId = (user as any).organizationId;
      }
      return token;
    },
    async session(params: any) {
      const { session, token } = params;
      (session as any).provider = (token as any).provider;
      (session as any).accessToken = (token as any).accessToken;
      session.user = {
        ...session.user,
        id: (token as any).id as string | undefined,
        email: ((token as any).email ?? session.user?.email) as string | null | undefined,
        image: ((session.user?.image ?? (token as any).picture) ??
          null) as string | null | undefined,
        role: (token as any).role as string | undefined,
        organizationId: (token as any).organizationId as string | undefined,
      };
      return session;
    },
  },
};

const { handlers, auth } = NextAuth(authConfig);

export { auth };
export const GET = handlers.GET;
export const POST = handlers.POST;
