# availability — Bookable Slot Computation (read-only)

Computes available appointment slots for a professional + service from their weekly working hours. No bookings exist yet, so availability = working hours minus past/too-soon times; the booking epic will additionally subtract taken appointments.

## Endpoint (API v1, authenticated)
- `GET /v1/professionals/:id/availability?serviceId=<uuid>&days=<1-14>` → `AvailabilityResponse` (`durationMinutes`, `days[]` each `{ date, weekday, slots[] }`, slot = `{ start, end }` as `HH:mm` local).
- `400` if `serviceId` is missing; `404` if the service is not this professional's / inactive.

## Design
- Pure `domain/slots.ts` (`computeDaySlotStarts`, `minutesToHHmm`) — unit-tested; a service fits only if it ends within a working window.
- Slot step 15 min; 120-min lead time for "today". "Today"/weekday/now are resolved in `Asia/Jerusalem` (`Intl.DateTimeFormat`).
- Deny-by-default `JwtAuthGuard`; working hours read from `professional_working_hours`.

## Verification
Slot domain — executed unit tests (6). Module — syntax-checked (0 real errors). Endpoint — e2e spec authored; runs in real env against seeded Postgres.
