# users — Profile / Account Management

Owns the authenticated user's basic profile (read + update). Reuses identity's JWT guard and pool.

## Endpoints (API v1, authenticated)
- `GET /v1/me` → `MeResponse { id, phone, role, displayName }`
- `PATCH /v1/me` `{ displayName }` → `MeResponse`

Display names are validated (1–60 chars, no control characters; Hebrew supported) via `@barber-marketplace/validation`.

## Verification status
Authored + syntax-checked; runs in the real environment (needs `@nestjs/*`, `pg`, Postgres with migrations 0001+0002).
