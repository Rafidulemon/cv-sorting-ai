import { Global, Module } from "@nestjs/common";
import { RbacGuard } from "../../guards/rbac.guard";
import { AuditModule } from "../audit/audit.module";

@Global()
@Module({
  imports: [AuditModule],
  providers: [RbacGuard],
  exports: [RbacGuard],
})
export class RbacModule {}
