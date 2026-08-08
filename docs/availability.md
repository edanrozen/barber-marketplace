# Availability & Slot Computation (MVP)

## What a customer can now do
On a professional's profile, **tap a service** → the app fetches and shows **available time slots** grouped by day (Hebrew dates, `HH:mm` slots). Tapping a slot previews the (next-epic) booking flow. Slots come from each professional's weekly **working hours** (seeded), a 15-minute grid, and a 2-hour lead time for today, in Israel time.

## Data
`professional_working_hours` (migration 0004) + `seeds/0003_working_hours.sql`: Sun-Thu full days, Friday half-day (varies per professional), Saturday closed.

## Run (real environment)
Apply migrations `0001`-`0004` + seeds `0001`/`0002`/`0003`; start backend + app; open a professional, tap a service, see slots. `GET /v1/professionals/:id/availability?serviceId=…&days=7`.

## Not yet (booking epic)
Slots are not yet reservable, and taken appointments aren't subtracted (no bookings exist). The booking engine adds slot holds, conflict prevention, and confirmation.

## Verification status
Slot computation — executed unit tests. Module + e2e — authored, syntax-checked; e2e runs in real env. Mobile — authored; validated on a device.
