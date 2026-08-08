# Payments — Cash-First (MVP)

## What a customer now sees
Booking a slot creates a **cash payment** for the service price. The **confirmation screen** shows "תשלום: מזומן בהגעה", and **My Bookings** shows the payment method + status ("מזומן בהגעה · ממתין לתשלום") per booking. No card entry, no online charge.

## Architecture for future card/Bit (no rework)
A `PaymentProvider` seam dispatches by method; today only `CashPaymentProvider` is registered. Adding the Israeli card/Bit processor = implement the same port (create a processor intent → return `provider_ref`), register it under `PAYMENT_PROVIDERS`, widen `SUPPORTED_METHODS`, and add a `method` choice at booking time. The `payments` table (`method`, `status`, `provider_ref`) already supports it.

## Data
`payments` (migration 0007), one per booking (`booking_id` unique). Amounts are integer agorot.

## Run (real environment)
Apply migrations `0001`-`0007` + seeds; book a slot → confirmation shows cash; `GET /v1/payments` returns a `cash` `pending` payment; My Bookings shows it.

## Verification status
Payment policy — executed unit tests. Module + e2e — authored, syntax-checked; e2e runs in real env. Mobile — authored; validated on a device.
