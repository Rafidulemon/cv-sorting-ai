import { Injectable } from "@nestjs/common";

@Injectable()
export class InappService {
  async sendInApp(payload: Record<string, unknown>) {
    return { sent: true, channel: "in-app", payload };
  }
}
