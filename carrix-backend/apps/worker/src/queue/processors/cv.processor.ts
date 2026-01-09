import { Injectable } from "@nestjs/common";
import { CvPipeline } from "../../services/cv/cv.pipeline";

@Injectable()
export class CvProcessor {
  constructor(private readonly cvPipeline: CvPipeline) {}

  async handle(payload: { content: Buffer | string }) {
    return this.cvPipeline.process(payload.content);
  }
}
