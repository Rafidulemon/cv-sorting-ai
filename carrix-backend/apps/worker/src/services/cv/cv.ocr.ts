import { Injectable } from "@nestjs/common";

@Injectable()
export class CvOcr {
  async extract(content: Buffer | string) {
    return content.toString();
  }
}
