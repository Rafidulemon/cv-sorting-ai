import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuditService } from "../modules/audit/audit.service";
import type { RequestWithUser } from "./auth.guard";

const ADMIN_ROLES = new Set([
  "OWNER",
  "ADMIN",
  "COMPANY_ADMIN",
  "SUPER_ADMIN",
  "TEAM_ADMIN",
]);

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly auditService: AuditService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const role = (request.user?.role as string | undefined) ?? null;

    if (!role) {
      await this.auditService.record({
        event: "auth.denied",
        reason: "missing_role",
        path: request.url,
        method: request.method,
      });
      throw new ForbiddenException("Role required");
    }

    if (!ADMIN_ROLES.has(role)) {
      await this.auditService.record({
        event: "auth.denied",
        reason: "insufficient_role",
        role,
        path: request.url,
        method: request.method,
      });
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
