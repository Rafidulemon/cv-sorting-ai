import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppConfig } from "./config/app.config";
import { validateEnv } from "./config/env.config";
import { HealthModule } from "./health/health.module";
import { QueueModule } from "./queue/queue.module";
import { AuthModule } from "./modules/auth/auth.module";
import { OrgModule } from "./modules/org/org.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { JobModule } from "./modules/job/job.module";
import { CandidateModule } from "./modules/candidate/candidate.module";
import { FileModule } from "./modules/file/file.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { AuditModule } from "./modules/audit/audit.module";
import { SecurityModule } from "./modules/security/security.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      validate: validateEnv,
      load: [AppConfig],
    }),
    HealthModule,
    QueueModule,
    AuthModule,
    OrgModule,
    RbacModule,
    JobModule,
    CandidateModule,
    FileModule,
    NotificationModule,
    AuditModule,
    SecurityModule,
  ],
})
export class AppModule {}
