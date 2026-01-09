import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const port = process.env.WORKER_PORT || 4001;

  await app.init();
  console.log(`Worker booted (queue-driven) on port ${port}`);
}

bootstrap();
