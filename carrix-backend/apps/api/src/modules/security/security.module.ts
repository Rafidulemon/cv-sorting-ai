import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthGuard } from "../../guards/auth.guard";
import { OrgGuard } from "../../guards/org.guard";
import { AuditModule } from "../audit/audit.module";

@Global()
@Module({
  imports: [ConfigModule, AuditModule],
  providers: [AuthGuard, OrgGuard],
  exports: [AuthGuard, OrgGuard],
})
export class SecurityModule {}
