import type { AuthSession, OtpRequestResponse, TokenPair } from '@barber-marketplace/api-contracts';
import { apiRequest } from './client';

export const requestOtp = (phone: string): Promise<OtpRequestResponse> =>
  apiRequest<OtpRequestResponse>('auth/otp/request', { method: 'POST', body: { phone } });

export const verifyOtp = (challengeId: string, code: string): Promise<AuthSession> =>
  apiRequest<AuthSession>('auth/otp/verify', { method: 'POST', body: { challengeId, code } });

export const refreshTokens = (refreshToken: string): Promise<TokenPair> =>
  apiRequest<TokenPair>('auth/refresh', { method: 'POST', body: { refreshToken } });

export const logout = (refreshToken: string): Promise<{ ok: true }> =>
  apiRequest<{ ok: true }>('auth/logout', { method: 'POST', body: { refreshToken } });
