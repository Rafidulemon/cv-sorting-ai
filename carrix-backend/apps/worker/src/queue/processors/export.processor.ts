import { Injectable } from "@nestjs/common";

@Injectable()
export class ExportProcessor {
  async handle(payload: Record<string, unknown>) {
    return { exported: true, payload };
  }
}
