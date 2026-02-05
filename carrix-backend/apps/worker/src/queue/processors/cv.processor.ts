import { Injectable } from "@nestjs/common";
import { CvPipeline } from "../../services/cv/cv.pipeline";

@Injectable()
export class CvProcessor {
  constructor(private readonly cvPipeline: CvPipeline) {}

  async handle(payload: { content: Buffer | string }) {
    const buffer = typeof payload.content === "string" ? Buffer.from(payload.content) : payload.content;
    return this.cvPipeline.process({ buffer });
  }
}
