import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { WorkerConfig } from "./config/env.config";
import { QueueModule } from "./queue/queue.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [WorkerConfig],
    }),
    QueueModule,
    HealthModule,
  ],
})
export class AppModule {}
