import { Injectable } from "@nestjs/common";

@Injectable()
export class OpenAIService {
  async generate(prompt: string) {
    return { provider: "openai", prompt, output: "TODO: connect to OpenAI" };
  }
}
