import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationService {
  async send(payload: Record<string, unknown>) {
    return { sent: true, payload };
  }
}
