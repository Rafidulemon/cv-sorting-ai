import { Injectable } from "@nestjs/common";

@Injectable()
export class OllamaService {
  async generate(prompt: string) {
    return { provider: "ollama", prompt, output: "TODO: connect to Ollama" };
  }
}
