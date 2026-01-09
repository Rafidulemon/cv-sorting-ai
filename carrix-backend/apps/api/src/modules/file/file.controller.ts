import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { FileService } from "./file.service";
import { AuthGuard } from "../../guards/auth.guard";
import { OrgGuard } from "../../guards/org.guard";

@Controller("files")
@UseGuards(AuthGuard, OrgGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post("upload-url")
  getUploadUrl(@Body("filename") filename: string) {
    return this.fileService.getUploadUrl(filename);
  }
}
