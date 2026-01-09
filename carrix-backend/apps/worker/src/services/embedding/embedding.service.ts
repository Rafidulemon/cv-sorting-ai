import { Injectable } from "@nestjs/common";

@Injectable()
export class EmbeddingService {
  async embed(text: string) {
    return {
      model: "mock-embedding",
      vector: Array.from({ length: 4 }).map((_, index) => text.length + index),
    };
  }
}
