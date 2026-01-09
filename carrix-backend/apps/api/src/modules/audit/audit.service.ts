import { Injectable } from "@nestjs/common";

@Injectable()
export class AuditService {
  async record(event: Record<string, unknown>) {
    // TODO: persist audit events
    return { recorded: true, event };
  }
}
