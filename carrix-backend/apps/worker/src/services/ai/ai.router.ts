import { Injectable } from "@nestjs/common";
import { OllamaService } from "./ollama.service";
import { OpenAIService } from "./openai.service";
import { GeminiService } from "./gemini.service";

export type AiProvider = "ollama" | "openai" | "gemini";

@Injectable()
export class AiRouter {
  constructor(
    private readonly ollamaService: OllamaService,
    private readonly openAiService: OpenAIService,
    private readonly geminiService: GeminiService,
  ) {}

  async generate(prompt: string, provider: AiProvider = "openai") {
    switch (provider) {
      case "ollama":
        return this.ollamaService.generate(prompt);
      case "gemini":
        return this.geminiService.generate(prompt);
      default:
        return this.openAiService.generate(prompt);
    }
  }
}
