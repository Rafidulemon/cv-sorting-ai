import { Injectable } from "@nestjs/common";

@Injectable()
export class CandidateService {
  async list() {
    return [{ id: "cand-1", name: "Jane Doe", score: 0.87 }];
  }

  async create(payload: Record<string, unknown>) {
    return { id: "cand-new", ...payload };
  }
}
