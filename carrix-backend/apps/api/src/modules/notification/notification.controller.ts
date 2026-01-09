import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AuthGuard } from "../../guards/auth.guard";
import { OrgGuard } from "../../guards/org.guard";

@Controller("notifications")
@UseGuards(AuthGuard, OrgGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  send(@Body() body: Record<string, unknown>) {
    return this.notificationService.send(body);
  }
}
