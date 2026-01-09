import { Injectable } from "@nestjs/common";
import { CvOcr } from "./cv.ocr";
import { CvParser } from "./cv.parser";
import { EmbeddingService } from "../embedding/embedding.service";
import { ScoringService } from "../scoring/scoring.service";

@Injectable()
export class CvPipeline {
  constructor(
    private readonly cvOcr: CvOcr,
    private readonly cvParser: CvParser,
    private readonly embeddingService: EmbeddingService,
    private readonly scoringService: ScoringService,
  ) {}

  async process(content: Buffer | string) {
    const text = await this.cvOcr.extract(content);
    const parsed = this.cvParser.parse(text);
    const embedding = await this.embeddingService.embed(text);
    const score = await this.scoringService.score(parsed);

    return { ...parsed, embedding, score };
  }
}
