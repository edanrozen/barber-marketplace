# identity — Authentication & Identity

Owns phone-OTP authentication, sessions, and token lifecycle. Category-agnostic (no barber specifics).

## Endpoints (public plane, API v1)
- `POST /v1/auth/otp/request` `{ phone }` → `{ challengeId, resendAvailableInSeconds }`
- `POST /v1/auth/otp/verify` `{ challengeId, code }` → `AuthSession { user, tokens, isNewUser }`
- `POST /v1/auth/refresh` `{ refreshToken }` → `TokenPair`
- `POST /v1/auth/logout` `{ refreshToken }` → `{ ok: true }`

## Domain (pure, unit-tested)
- `domain/otp.ts` — 6-digit code generation, peppered phone-bound HMAC hashing, constant-time verify, attempt/expiry/cooldown state machine.
- `domain/tokens.ts` — opaque refresh tokens (only SHA-256 hash stored), rotation with **reuse detection** (a used token revokes its whole family).
- `domain/jwt.ts` — dependency-free HS256 access tokens (sign/verify, tamper + expiry rejection).

## Security
Codes/refresh tokens are never stored in plaintext. Access tokens are short-lived (900 s) HS256 JWTs; refresh tokens rotate single-use with family revocation on reuse. Guard is deny-by-default.

## Config (env)
`APP_JWT_SIGNING_KEY`, `OTP_PEPPER`, `DATABASE_URL`.

## Verification status
Domain logic: **executed unit tests pass**. Application/HTTP/adapters: authored + syntax-checked; run in the real environment (needs `@nestjs/*`, `pg`, Postgres).
