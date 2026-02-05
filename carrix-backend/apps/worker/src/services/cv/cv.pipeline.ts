import { Injectable } from "@nestjs/common";
import { CvOcr } from "./cv.ocr";
import { CvParser, ParsedResume } from "./cv.parser";
import { EmbeddingService } from "../embedding/embedding.service";
import { ScoringService } from "../scoring/scoring.service";

type PipelineInput = {
  buffer: Buffer;
  mimeType?: string | null;
  fileName?: string | null;
  jobEmbedding?: number[] | null;
  jobSkills?: string[];
};

type PipelineResult = {
  text: string;
  textSource: string;
  parsedJson: ParsedResume;
  extractedFields: ParsedResume;
  fullEmbedding: number[];
  chunkEmbeddings: { chunkIndex: number; text: string; embedding: number[] }[];
  jobEmbedding?: number[] | null;
  score: { overallScore: number; breakdown: Record<string, unknown> };
};

@Injectable()
export class CvPipeline {
  constructor(
    private readonly cvOcr: CvOcr,
    private readonly cvParser: CvParser,
    private readonly embeddingService: EmbeddingService,
    private readonly scoringService: ScoringService,
  ) {}

  async process(input: PipelineInput): Promise<PipelineResult> {
    const extraction = await this.cvOcr.extract(input.buffer, {
      mimeType: input.mimeType,
      fileName: input.fileName,
    });

    const parsed = await this.cvParser.parse(extraction.text);

    const chunks = this.embeddingService.chunkText(extraction.text);
    const chunkTexts = chunks.length ? chunks : [extraction.text];
    const chunkEmbeddings = await this.embeddingService.embedChunks(chunkTexts);
    const fullEmbedding = await this.embeddingService.embed(extraction.text);

    const score = await this.scoringService.score({
      resumeSkills: parsed.parsedJson.skills || [],
      jobSkills: input.jobSkills || [],
      resumeEmbedding: fullEmbedding,
      jobEmbedding: input.jobEmbedding ?? undefined,
      totalYears: parsed.parsedJson.totalYears ?? undefined,
    });

    return {
      text: extraction.text,
      textSource: extraction.source,
      parsedJson: parsed.parsedJson,
      extractedFields: parsed.extractedFields,
      fullEmbedding,
      chunkEmbeddings: chunkTexts.map((text, idx) => ({
        chunkIndex: idx,
        text,
        embedding: chunkEmbeddings[idx] ?? [],
      })),
      jobEmbedding: input.jobEmbedding ?? null,
      score,
    };
  }
}
