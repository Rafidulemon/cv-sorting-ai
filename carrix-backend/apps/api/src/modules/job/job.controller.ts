import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JobService } from "./job.service";
import { AuthGuard } from "../../guards/auth.guard";
import { OrgGuard } from "../../guards/org.guard";
import { RbacGuard } from "../../guards/rbac.guard";

@Controller("jobs")
@UseGuards(AuthGuard, OrgGuard, RbacGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  list() {
    return this.jobService.list();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.jobService.create(body);
  }
}
