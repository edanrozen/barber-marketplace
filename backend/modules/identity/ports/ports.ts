/** Ports (interfaces) for the identity module. Concrete adapters are bound in identity.module.ts. */
export interface OtpChallengeRow {
  readonly id: string; readonly phone: string; readonly codeHash: string;
  readonly attempts: number; readonly maxAttempts: number;
  readonly expiresAt: number; readonly consumedAt: number | null; readonly lastSentAt: number;
}
export interface OtpStore {
  create(input: { phone: string; codeHash: string; expiresAt: number; maxAttempts: number }): Promise<{ id: string }>;
  findById(id: string): Promise<OtpChallengeRow | null>;
  incrementAttempts(id: string): Promise<void>;
  markConsumed(id: string, at: number): Promise<void>;
  findLatestByPhone(phone: string): Promise<OtpChallengeRow | null>;
}
export const OTP_STORE = Symbol('OTP_STORE');

export interface SmsSender { send(phone: string, message: string): Promise<void>; }
export const SMS_SENDER = Symbol('SMS_SENDER');

export interface RefreshRow {
  readonly id: string; readonly userId: string; readonly familyId: string; readonly tokenHash: string;
  readonly usedAt: number | null; readonly revokedAt: number | null; readonly expiresAt: number;
}
export interface RefreshTokenStore {
  issue(input: { userId: string; familyId: string; tokenHash: string; expiresAt: number; deviceLabel?: string }): Promise<{ id: string }>;
  findByHash(tokenHash: string): Promise<RefreshRow | null>;
  markUsed(id: string, rotatedToId: string, at: number): Promise<void>;
  revokeByHash(tokenHash: string, at: number): Promise<void>;
  revokeFamily(familyId: string, at: number): Promise<void>;
}
export const REFRESH_TOKEN_STORE = Symbol('REFRESH_TOKEN_STORE');

export interface UserRecord { readonly id: string; readonly phone: string; readonly role: string; }
export interface UserRepository {
  findByPhoneAndRole(phone: string, role: string): Promise<UserRecord | null>;
  createCustomer(phone: string): Promise<UserRecord>;
  findById(id: string): Promise<UserRecord | null>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface AuthConfig { readonly jwtSecret: string; readonly otpPepper: string; readonly accessTtlSeconds: number; }
export const AUTH_CONFIG = Symbol('AUTH_CONFIG');
