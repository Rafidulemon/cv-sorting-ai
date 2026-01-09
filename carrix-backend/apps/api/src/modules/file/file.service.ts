import { Injectable } from "@nestjs/common";

@Injectable()
export class FileService {
  async getUploadUrl(filename: string) {
    return {
      url: `https://example-bucket/mock-upload/${filename}`,
      method: "PUT",
      expiresIn: 3600,
    };
  }
}
