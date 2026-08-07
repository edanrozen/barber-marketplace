# notifications — In-App Notification Feed

A per-user notification feed, written by domain events (currently booking confirmed/cancelled). No external push (FCM/APNs) yet — in-app only, so no new infrastructure.

## Endpoints (API v1, authenticated)
- `GET /v1/notifications` → `NotificationView[]` (newest first).
- `POST /v1/notifications/:id/read` → `{ ok: true }`.

## Design
- Pure `domain/templates.ts` builds the (Hebrew) title/body — unit-tested.
- `NotificationsService` is exported and called by the booking module (best-effort; a notification failure never fails the booking).
- Deny-by-default `JwtAuthGuard`; `read_at` marks read.

## Verification
Templates — executed unit tests (2). Module — syntax-checked (0 real errors). Endpoints — e2e spec authored; runs in real env against seeded Postgres.
