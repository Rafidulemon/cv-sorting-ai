import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuditService } from "../modules/audit/audit.service";
import type { RequestWithUser } from "./auth.guard";

@Injectable()
export class OrgGuard implements CanActivate {
  constructor(private readonly auditService: AuditService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userOrgId = request.user?.organizationId ?? request.organizationId ?? null;
    const requestedOrgIdHeader = request.headers?.["x-org-id"];
    const requestedOrgId = Array.isArray(requestedOrgIdHeader)
      ? requestedOrgIdHeader[0]
      : requestedOrgIdHeader ?? null;

    if (!userOrgId) {
      await this.auditService.record({
        event: "auth.denied",
        reason: "missing_org",
        path: request.url,
        method: request.method,
      });
      throw new ForbiddenException("Organization context required");
    }

    if (requestedOrgId && requestedOrgId !== userOrgId) {
      await this.auditService.record({
        event: "auth.denied",
        reason: "org_mismatch",
        expectedOrg: userOrgId,
        providedOrg: requestedOrgId,
        path: request.url,
        method: request.method,
      });
      throw new ForbiddenException("Invalid organization access");
    }

    (request as any).organizationId = userOrgId;
    return true;
  }
}
