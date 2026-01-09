import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { OrgService } from "./org.service";
import { AuthGuard } from "../../guards/auth.guard";
import { OrgGuard } from "../../guards/org.guard";

@Controller("org")
@UseGuards(AuthGuard, OrgGuard)
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get()
  list() {
    return this.orgService.list();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.orgService.create(body);
  }
}
