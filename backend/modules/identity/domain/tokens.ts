import { createHash, randomBytes } from 'node:crypto';

export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Opaque refresh token; only its SHA-256 hash is ever stored. */
export const generateRefreshToken = (): string => randomBytes(32).toString('base64url');
export const hashRefreshToken = (token: string): string => createHash('sha256').update(token).digest('base64url');

export interface RefreshRecord {
  readonly tokenHash: string;
  readonly familyId: string;
  readonly usedAt: number | null;
  readonly revokedAt: number | null;
  readonly expiresAt: number;
}

/**
 * Rotation with reuse detection: a valid unused token rotates; a token already used is a REUSE
 * signal → the whole family must be revoked (stolen-token defense).
 */
export type RotationResult =
  | { readonly action: 'rotate'; readonly familyId: string }
  | { readonly action: 'reject'; readonly reason: 'not_found' | 'expired' | 'revoked' }
  | { readonly action: 'reuse_detected'; readonly familyId: string };

export const evaluateRefresh = (record: RefreshRecord | null, nowSeconds: number): RotationResult => {
  if (record === null) return { action: 'reject', reason: 'not_found' };
  if (record.revokedAt !== null) return { action: 'reject', reason: 'revoked' };
  if (nowSeconds > record.expiresAt) return { action: 'reject', reason: 'expired' };
  if (record.usedAt !== null) return { action: 'reuse_detected', familyId: record.familyId };
  return { action: 'rotate', familyId: record.familyId };
};
