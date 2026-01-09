import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  async login(payload: Record<string, unknown>) {
    return {
      accessToken: "mock-token",
      user: payload,
    };
  }

  async register(payload: Record<string, unknown>) {
    return {
      registered: true,
      user: payload,
    };
  }
}
