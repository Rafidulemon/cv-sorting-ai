import { Injectable } from "@nestjs/common";

@Injectable()
export class ScoringService {
  async score(parsed: Record<string, unknown>) {
    return { value: 0.8, basis: parsed };
  }
}
