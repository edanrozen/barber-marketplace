# Scheduled Booking (MVP)

## What a customer can now do
Open a professional → pick a service → pick an available slot → **confirm and book it**. See **My Bookings** (from the home header) with status, time, price; **cancel** a confirmed booking, which frees the slot. The booked slot immediately disappears from availability. Hebrew, RTL.

## Integrity & safety
Server re-validates the slot against live availability; a DB unique index prevents double-booking under concurrency (returns 409). Cancellation frees the slot.

## Data
`bookings` (migration 0005). No new infrastructure.

## Run (real environment)
Apply migrations `0001`-`0005` + seeds; start backend + app; book a slot, view/cancel it in My Bookings. Endpoints: `POST/GET /v1/bookings`, `POST /v1/bookings/:id/cancel`.

## Not yet
No payment capture (cash-first), no barber acceptance/notifications, no reschedule, no on-demand. Those are later milestones.

## Verification status
`canCancel` — executed unit test; slot math — executed availability tests. Module + e2e — authored, syntax-checked; e2e runs in real env. Mobile — authored; validated on a device.
