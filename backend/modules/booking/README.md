# booking — Scheduled Booking Engine

Lets a customer reserve an available slot; lists and cancels their bookings. Seeded professionals auto-confirm (no barber acceptance / no barber app yet). Payment is out of scope (cash/pay-in-person for the MVP).

## Endpoints (API v1, authenticated)
- `POST /v1/bookings` `{ professionalId, serviceId, date, start }` → `BookingView` (201).
- `GET /v1/bookings` → `BookingView[]` (the caller's bookings, newest first).
- `POST /v1/bookings/:id/cancel` → `{ ok: true }`.

## Integrity
- The requested slot is re-validated server-side against live availability (`AvailabilityService.isSlotAvailable`) — the client cannot book outside working hours or a taken slot.
- A **partial unique index** `uq_bookings_slot_active (professional_profile_id, scheduled_date, start_minute) WHERE status='confirmed'` makes double-booking impossible even under a race; the repo maps the `23505` violation to a `409 slot_taken`.
- Cancelling sets `status='cancelled'`, which frees the slot (excluded from the unique index and from availability).

## Verification
Pure `canCancel` — executed unit test. Module — syntax-checked (0 real errors). Endpoints — e2e spec authored; runs in real env against seeded Postgres.
