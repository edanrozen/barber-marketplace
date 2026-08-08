# payments — Cash-First Payments (card/Bit-ready)

Records a payment for each booking. The MVP charges nothing online — **cash on arrival** — but the architecture is built so real processors plug in without rework.

## Endpoints (API v1, authenticated)
- `GET /v1/payments` → `PaymentView[]` (the caller's payments).

## The provider seam (how card/Bit plug in later)
- `PaymentProvider` port: `{ method; initiate(input) → { status, providerRef } }`.
- `CashPaymentProvider` returns `pending` (collected in person, no charge, no `providerRef`).
- Providers are registered under the `PAYMENT_PROVIDERS` token; `PaymentsService` dispatches by `method`.
- To add card/Bit: implement the port (create a processor intent, return its `provider_ref`), register it, and widen `SUPPORTED_METHODS`. The `payments` table already has `method`, `status`, `provider_ref`.

## Integration
Booking create calls `PaymentsService.initiateForBooking(...)` with `method: 'cash'` (best-effort; a transactional outbox links booking+payment in the real env). Pure status/method policy in `domain/payments.ts` is unit-tested.

## Not yet (deliberately)
No processor, no webhooks, no refunds/capture flow, and no double-entry ledger — those arrive with real online money movement. `provider_ref` + `status` transitions are the seam for them.

## Verification
Payment policy — executed unit tests (3). Module — syntax-checked (0 real errors). Endpoint — e2e spec authored; runs in real env against seeded Postgres.
