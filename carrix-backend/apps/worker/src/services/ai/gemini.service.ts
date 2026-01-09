import { Injectable } from "@nestjs/common";

@Injectable()
export class GeminiService {
  async generate(prompt: string) {
    return { provider: "gemini", prompt, output: "TODO: connect to Gemini" };
  }
}
