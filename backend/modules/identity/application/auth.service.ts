import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { type AuthSession, type OtpRequestResponse, type TokenPair } from '@barber-marketplace/api-contracts';
import { isValidOtpCode, normalizeIsraeliMobile } from '@barber-marketplace/validation';
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '@barber-marketplace/errors';
import * as Otp from '../domain/otp';
import * as Tokens from '../domain/tokens';
import { signHs256 } from '../domain/jwt';
import {
  AUTH_CONFIG, OTP_STORE, REFRESH_TOKEN_STORE, SMS_SENDER, USER_REPOSITORY,
  type AuthConfig, type OtpStore, type RefreshTokenStore, type SmsSender, type UserRepository,
} from '../ports/ports';

const CUSTOMER_ROLE = 'customer';
const nowSeconds = (): number => Math.floor(Date.now() / 1000);

@Injectable()
export class AuthService {
  constructor(
    @Inject(OTP_STORE) private readonly otp: OtpStore,
    @Inject(SMS_SENDER) private readonly sms: SmsSender,
    @Inject(REFRESH_TOKEN_STORE) private readonly refresh: RefreshTokenStore,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async requestOtp(rawPhone: string): Promise<OtpRequestResponse> {
    const normalized = normalizeIsraeliMobile(rawPhone);
    if (!normalized.ok) throw new ValidationError('invalid_phone', 'מספר טלפון נייד ישראלי לא תקין.');
    const phone = normalized.e164;

    const latest = await this.otp.findLatestByPhone(phone);
    if (latest !== null && !Otp.canResend(latest.lastSentAt, nowSeconds())) {
      throw new ConflictError('otp_resend_cooldown', 'יש להמתין מעט לפני בקשת קוד חדש.');
    }

    const code = Otp.generateOtpCode();
    const codeHash = Otp.hashOtp(code, phone, this.config.otpPepper);
    const created = await this.otp.create({
      phone, codeHash, expiresAt: nowSeconds() + Otp.OTP_TTL_SECONDS, maxAttempts: Otp.OTP_MAX_ATTEMPTS,
    });
    await this.sms.send(phone, `קוד האימות שלך הוא ${code}`);
    return { challengeId: created.id, resendAvailableInSeconds: Otp.OTP_RESEND_COOLDOWN_SECONDS };
  }

  async verifyOtp(challengeId: string, code: string): Promise<AuthSession> {
    if (!isValidOtpCode(code)) throw new ValidationError('invalid_otp_code', 'קוד האימות חייב להכיל שש ספרות.');
    const challenge = await this.otp.findById(challengeId);
    if (challenge === null) throw new NotFoundError('otp_not_found', 'בקשת האימות לא נמצאה או שפגה.');

    const matches = Otp.verifyOtpHash(code, challenge.phone, this.config.otpPepper, challenge.codeHash);
    const check = Otp.checkOtp(
      { attempts: challenge.attempts, expiresAt: challenge.expiresAt, consumed: challenge.consumedAt !== null },
      nowSeconds(), matches,
    );
    if (!check.ok) {
      if (check.reason === 'mismatch') await this.otp.incrementAttempts(challengeId);
      throw new ValidationError(`otp_${check.reason}`, 'קוד האימות שגוי או שאינו בתוקף.');
    }

    await this.otp.markConsumed(challengeId, nowSeconds());
    const existing = await this.users.findByPhoneAndRole(challenge.phone, CUSTOMER_ROLE);
    const isNewUser = existing === null;
    const user = existing ?? (await this.users.createCustomer(challenge.phone));
    const tokens = await this.issueTokens(user.id, user.role, randomUUID());
    return { user: { id: user.id, phone: user.phone, role: user.role }, tokens, isNewUser };
  }

  async refreshSession(refreshToken: string): Promise<TokenPair> {
    const record = await this.refresh.findByHash(Tokens.hashRefreshToken(refreshToken));
    const decision = Tokens.evaluateRefresh(record, nowSeconds());
    if (decision.action === 'reject') {
      throw new AuthorizationError('refresh_rejected', 'ההתחברות פגה. יש להתחבר מחדש.');
    }
    if (decision.action === 'reuse_detected') {
      await this.refresh.revokeFamily(decision.familyId, nowSeconds());
      throw new AuthorizationError('refresh_reuse_detected', 'זוהתה פעילות חריגה. יש להתחבר מחדש.');
    }
    const current = record as NonNullable<typeof record>;
    const user = await this.users.findById(current.userId);
    if (user === null) throw new NotFoundError('user_not_found', 'המשתמש לא נמצא.');

    const nextRefresh = await this.issueRefresh(user.id, current.familyId);
    await this.refresh.markUsed(current.id, nextRefresh.id, nowSeconds());
    return {
      accessToken: this.issueAccess(user.id, user.role),
      refreshToken: nextRefresh.token,
      accessTokenExpiresInSeconds: this.config.accessTtlSeconds,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refresh.revokeByHash(Tokens.hashRefreshToken(refreshToken), nowSeconds());
  }

  private issueAccess(userId: string, role: string): string {
    const now = nowSeconds();
    return signHs256({ sub: userId, role, iat: now, exp: now + this.config.accessTtlSeconds }, this.config.jwtSecret);
  }

  private async issueRefresh(userId: string, familyId: string): Promise<{ id: string; token: string }> {
    const token = Tokens.generateRefreshToken();
    const created = await this.refresh.issue({
      userId, familyId, tokenHash: Tokens.hashRefreshToken(token), expiresAt: nowSeconds() + Tokens.REFRESH_TTL_SECONDS,
    });
    return { id: created.id, token };
  }

  private async issueTokens(userId: string, role: string, familyId: string): Promise<TokenPair> {
    const refresh = await this.issueRefresh(userId, familyId);
    return { accessToken: this.issueAccess(userId, role), refreshToken: refresh.token, accessTokenExpiresInSeconds: this.config.accessTtlSeconds };
  }
}
