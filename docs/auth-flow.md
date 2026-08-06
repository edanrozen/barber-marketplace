# E5 — Authentication & Profile: end-to-end flow

## What a user can do
Launch → enter Israeli mobile number → receive OTP → verify → land on the authenticated home → view/edit profile → sign out. Sessions persist across cold starts (secure storage + `/me` validation). Interface is Hebrew, RTL.

## Sequence
1. **PhoneEntry** → `POST /v1/auth/otp/request { phone }`. Backend normalizes to E.164, generates a code, stores only its peppered hash, "sends" it (dev adapter logs it), returns `challengeId`.
2. **OtpEntry** → `POST /v1/auth/otp/verify { challengeId, code }`. Backend verifies (constant-time), consumes the challenge, finds-or-creates the customer, issues an HS256 access token + a rotating refresh token, returns `AuthSession` (`isNewUser` distinguishes register vs login).
3. App stores tokens in `expo-secure-store`; navigator swaps to the app stack.
4. **Home / Profile** → `GET /v1/me`, `PATCH /v1/me { displayName }` with `Authorization: Bearer <access>`. On 401 the client refreshes once (`POST /v1/auth/refresh`) and retries.
5. **Sign out** → `POST /v1/auth/logout { refreshToken }` revokes the session; local tokens cleared.

## Endpoints
| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | /v1/auth/otp/request | public | `{phone}` → `{challengeId, resendAvailableInSeconds}` |
| POST | /v1/auth/otp/verify | public | `{challengeId, code}` → `AuthSession` |
| POST | /v1/auth/refresh | public | `{refreshToken}` → `TokenPair` |
| POST | /v1/auth/logout | public | `{refreshToken}` → `{ok:true}` |
| GET | /v1/me | bearer | — → `MeResponse` |
| PATCH | /v1/me | bearer | `{displayName}` → `MeResponse` |

## Run the demo (real environment)
1. `npm install` at the repo root (installs workspaces).
2. Provision Postgres; set `DATABASE_URL`, `APP_JWT_SIGNING_KEY`, `OTP_PEPPER`.
3. Apply migrations `0001_core_schema` then `0002_auth` (up).
4. Activate the E4 cross-cutting layer (documented touch-points): call `configureApp(app)` in `main.ts`; register the idempotency `APP_INTERCEPTOR` + rate-limit guard; add `common/**` and exclude `**/*.test.ts` from the backend production build.
5. Start the backend. The dev SMS adapter prints the OTP to the server console.
6. In `apps/customer-mobile`, set `expo.extra.apiBaseUrl`, `npm install`, `npx expo start`, open on a device/simulator. Enter the phone, read the code from the server log, verify, and you're in.

## Verification status (honest)
- Security domain (phone/OTP/JWT/rotation): **executed unit tests pass** (26).
- Backend application/HTTP/adapters + mobile app: authored to convention, **syntax-checked** (backend) / not runnable in this sandbox (no `npm install`, DB, or device).
- e2e suite (`tests/e2e/auth.e2e-spec.ts`): authored; runs in the real environment against a test Postgres.
