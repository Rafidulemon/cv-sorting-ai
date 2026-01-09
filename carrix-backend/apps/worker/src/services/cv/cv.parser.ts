import { Injectable } from "@nestjs/common";
import { cleanText } from "../../utils/text-cleaner";

@Injectable()
export class CvParser {
  parse(text: string) {
    const normalized = cleanText(text);
    return {
      name: "Unknown",
      skills: [],
      summary: normalized.slice(0, 120),
    };
  }
}
