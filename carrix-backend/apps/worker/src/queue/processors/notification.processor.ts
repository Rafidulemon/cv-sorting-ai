import { Injectable } from "@nestjs/common";
import { EmailService } from "../../services/notification/email.service";
import { PushService } from "../../services/notification/push.service";
import { InappService } from "../../services/notification/inapp.service";

@Injectable()
export class NotificationProcessor {
  constructor(
    private readonly emailService: EmailService,
    private readonly pushService: PushService,
    private readonly inappService: InappService,
  ) {}

  async handle(payload: { channel: "email" | "push" | "in-app"; data: Record<string, unknown> }) {
    switch (payload.channel) {
      case "push":
        return this.pushService.sendPush(payload.data);
      case "in-app":
        return this.inappService.sendInApp(payload.data);
      default:
        return this.emailService.sendEmail(payload.data);
    }
  }
}
