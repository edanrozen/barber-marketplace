/** Authentication API contracts (Epic E5) — SSOT shared by mobile client and backend. */
export interface OtpRequestBody {
  readonly phone: string;
}
export interface OtpRequestResponse {
  readonly challengeId: string;
  readonly resendAvailableInSeconds: number;
}
export interface OtpVerifyBody {
  readonly challengeId: string;
  readonly code: string;
}
export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresInSeconds: number;
}
export interface RefreshBody {
  readonly refreshToken: string;
}
export interface LogoutBody {
  readonly refreshToken: string;
}
export interface AuthenticatedUser {
  readonly id: string;
  readonly phone: string;
  readonly role: string;
}
export interface AuthSession {
  readonly user: AuthenticatedUser;
  readonly tokens: TokenPair;
  /** true on first registration, false on subsequent logins. */
  readonly isNewUser: boolean;
}
