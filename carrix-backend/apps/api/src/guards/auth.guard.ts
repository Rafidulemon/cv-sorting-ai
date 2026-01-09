import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { jwtVerify, type JWTPayload } from "jose";
import { AuditService } from "../modules/audit/audit.service";

export type RequestWithUser = {
  user?: Record<string, unknown> & {
    id?: string;
    email?: string;
    role?: string | null;
    organizationId?: string | null;
  };
  organizationId?: string | null;
  headers: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  url?: string;
  method?: string;
  ip?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auditService: AuditService, private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      await this.auditService.record({
        event: "auth.denied",
        reason: "missing_token",
        path: request.url,
        method: request.method,
        ip: request.ip,
      });
      throw new UnauthorizedException("Missing authentication token");
    }

    const secret = this.configService.get<string>("NEXTAUTH_SECRET") ?? process.env.NEXTAUTH_SECRET;
    if (!secret) {
      await this.auditService.record({ event: "auth.denied", reason: "missing_secret", path: request.url });
      throw new UnauthorizedException("Auth secret not configured");
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const user = this.mapUser(payload);
      (request as any).user = user;
      (request as any).organizationId = user.organizationId ?? null;
      return true;
    } catch (error: any) {
      await this.auditService.record({
        event: "auth.denied",
        reason: "invalid_token",
        path: request.url,
        details: error?.message,
      });
      throw new UnauthorizedException("Invalid or expired session");
    }
  }

  private extractToken(request: RequestWithUser): string | null {
    const authHeader = request.headers?.["authorization"] ?? request.headers?.["Authorization"];
    if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }

    // Fallback to NextAuth session cookies
    const tokenFromCookies =
      request.cookies?.["next-auth.session-token"] ?? request.cookies?.["__Secure-next-auth.session-token"];
    return tokenFromCookies ?? null;
  }

  private mapUser(payload: JWTPayload) {
    const asAny = payload as any;
    return {
      id: (asAny.id as string | undefined) ?? (payload.sub as string | undefined),
      email: (asAny.email as string | undefined) ?? undefined,
      role: (asAny.role as string | null | undefined) ?? null,
      organizationId: (asAny.organizationId as string | null | undefined) ?? null,
      provider: asAny.provider ?? undefined,
    };
  }
}
