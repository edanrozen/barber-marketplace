/**
 * Rate-limit baseline — stricter on auth/payment/write (Constitution §API rules).
 * Values are a starting point; enforced at the gateway (@nestjs/throttler) in the real env.
 */
export interface RateLimitTier {
  readonly name: string;
  readonly ttlSeconds: number;
  readonly limit: number;
}

export const RATE_LIMIT_TIERS = {
  default: { name: 'default', ttlSeconds: 60, limit: 120 },
  write: { name: 'write', ttlSeconds: 60, limit: 30 },
  auth: { name: 'auth', ttlSeconds: 60, limit: 5 },
  payment: { name: 'payment', ttlSeconds: 60, limit: 10 },
} as const satisfies Record<string, RateLimitTier>;
