import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI | null;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
    this.model = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  }

  async embed(text: string): Promise<number[]> {
    const normalized = text.trim();
    if (!normalized.length) return [];

    if (!this.openai) {
      throw new Error("OPENAI_API_KEY missing: embeddings require OpenAI");
    }

    try {
      const toEmbed = this.prepareText(normalized);
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: toEmbed,
      });
      return response.data[0]?.embedding ?? [];
    } catch (error) {
      this.logger.error(`Embedding failed (${(error as Error).message})`);
      throw error;
    }
  }

  async embedChunks(chunks: string[]): Promise<number[][]> {
  if (!this.openai || !chunks.length) return [];

  const prepared = chunks.map(c => this.prepareText(c));

  const response = await this.openai.embeddings.create({
    model: this.model,
    input: prepared,
  });

  return response.data.map(d => d.embedding);
}


  chunkText(text: string, chunkSize = 1200, overlap = 120): string[] {
    if (!text.trim().length) return [];
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let start = 0;

    while (start < words.length) {
      const slice = words.slice(start, start + chunkSize);
      chunks.push(slice.join(" "));
      if (start + chunkSize >= words.length) break;
      start += chunkSize - overlap;
    }

    return chunks;
  }

  private prepareText(text: string): string {
    // Keep within ~1200 words (~6-7k tokens) to stay under 8k model limit comfortably.
    const words = text.split(/\s+/);
    if (words.length <= 1200) return text;
    return words.slice(0, 1200).join(" ");
  }
}
