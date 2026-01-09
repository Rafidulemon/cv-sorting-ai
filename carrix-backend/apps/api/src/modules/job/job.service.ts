import { Injectable } from "@nestjs/common";

@Injectable()
export class JobService {
  async list() {
    return [{ id: "job-1", title: "Software Engineer" }];
  }

  async create(payload: Record<string, unknown>) {
    return { id: "job-new", ...payload };
  }
}
