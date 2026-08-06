import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export const OTP_TTL_SECONDS = 300;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/** Cryptographically-random 6-digit code. */
export const generateOtpCode = (): string => randomInt(0, 1_000_000).toString().padStart(6, '0');

/** OTP is stored only as a peppered HMAC — never in plaintext. Phone-bound to prevent cross-use. */
export const hashOtp = (code: string, phone: string, pepper: string): string =>
  createHmac('sha256', pepper).update(`${phone}:${code}`).digest('base64url');

export const verifyOtpHash = (code: string, phone: string, pepper: string, storedHash: string): boolean => {
  const computed = Buffer.from(hashOtp(code, phone, pepper));
  const stored = Buffer.from(storedHash);
  return computed.length === stored.length && timingSafeEqual(computed, stored);
};

export interface OtpChallengeState {
  readonly attempts: number;
  readonly expiresAt: number;
  readonly consumed: boolean;
}
export type OtpCheck =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'expired' | 'consumed' | 'too_many_attempts' | 'mismatch' };

export const checkOtp = (state: OtpChallengeState, nowSeconds: number, matches: boolean): OtpCheck => {
  if (state.consumed) return { ok: false, reason: 'consumed' };
  if (nowSeconds > state.expiresAt) return { ok: false, reason: 'expired' };
  if (state.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: 'too_many_attempts' };
  if (!matches) return { ok: false, reason: 'mismatch' };
  return { ok: true };
};

export const canResend = (lastSentAt: number, nowSeconds: number): boolean =>
  nowSeconds - lastSentAt >= OTP_RESEND_COOLDOWN_SECONDS;
