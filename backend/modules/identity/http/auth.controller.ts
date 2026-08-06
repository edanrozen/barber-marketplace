import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  type AuthSession, type LogoutBody, type OtpRequestBody, type OtpRequestResponse,
  type OtpVerifyBody, type RefreshBody, type TokenPair,
} from '@barber-marketplace/api-contracts';
import { AuthService } from '../application/auth.service';

/** Public-plane auth endpoints (API v1). */
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('otp/request')
  @HttpCode(200)
  requestOtp(@Body() body: OtpRequestBody): Promise<OtpRequestResponse> {
    return this.auth.requestOtp(body.phone);
  }

  @Post('otp/verify')
  @HttpCode(200)
  verifyOtp(@Body() body: OtpVerifyBody): Promise<AuthSession> {
    return this.auth.verifyOtp(body.challengeId, body.code);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: RefreshBody): Promise<TokenPair> {
    return this.auth.refreshSession(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: LogoutBody): Promise<{ ok: true }> {
    await this.auth.logout(body.refreshToken);
    return { ok: true };
  }
}
