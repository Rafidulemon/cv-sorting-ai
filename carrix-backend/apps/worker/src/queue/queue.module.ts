import { Module } from "@nestjs/common";
import { CvProcessor } from "./processors/cv.processor";
import { NotificationProcessor } from "./processors/notification.processor";
import { ExportProcessor } from "./processors/export.processor";
import { AiRouter } from "../services/ai/ai.router";
import { OllamaService } from "../services/ai/ollama.service";
import { OpenAIService } from "../services/ai/openai.service";
import { GeminiService } from "../services/ai/gemini.service";
import { CvOcr } from "../services/cv/cv.ocr";
import { CvParser } from "../services/cv/cv.parser";
import { CvPipeline } from "../services/cv/cv.pipeline";
import { EmbeddingService } from "../services/embedding/embedding.service";
import { ScoringService } from "../services/scoring/scoring.service";
import { EmailService } from "../services/notification/email.service";
import { PushService } from "../services/notification/push.service";
import { InappService } from "../services/notification/inapp.service";

@Module({
  providers: [
    CvProcessor,
    NotificationProcessor,
    ExportProcessor,
    AiRouter,
    OllamaService,
    OpenAIService,
    GeminiService,
    CvOcr,
    CvParser,
    CvPipeline,
    EmbeddingService,
    ScoringService,
    EmailService,
    PushService,
    InappService,
  ],
  exports: [
    CvProcessor,
    NotificationProcessor,
    ExportProcessor,
    AiRouter,
    CvPipeline,
    EmailService,
    PushService,
    InappService,
  ],
})
export class QueueModule {}
