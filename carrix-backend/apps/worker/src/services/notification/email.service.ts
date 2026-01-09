import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  async sendEmail(payload: Record<string, unknown>) {
    return { sent: true, channel: "email", payload };
  }
}
