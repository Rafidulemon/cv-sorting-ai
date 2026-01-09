import { Injectable } from "@nestjs/common";

@Injectable()
export class OrgService {
  async list() {
    return [{ id: "org-1", name: "Example Org" }];
  }

  async create(payload: Record<string, unknown>) {
    return { id: "org-new", ...payload };
  }
}
