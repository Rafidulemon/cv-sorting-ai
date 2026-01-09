import { Injectable } from "@nestjs/common";

@Injectable()
export class PushService {
  async sendPush(payload: Record<string, unknown>) {
    return { sent: true, channel: "push", payload };
  }
}
