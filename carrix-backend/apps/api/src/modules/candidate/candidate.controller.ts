import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CandidateService } from "./candidate.service";
import { AuthGuard } from "../../guards/auth.guard";
import { OrgGuard } from "../../guards/org.guard";

@Controller("candidates")
@UseGuards(AuthGuard, OrgGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get()
  list() {
    return this.candidateService.list();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.candidateService.create(body);
  }
}
