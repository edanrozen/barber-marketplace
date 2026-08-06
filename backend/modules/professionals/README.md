# professionals — Professional Catalog (customer-facing, read-only)

Serves the customer browse + profile experience over **operational seed supply** (professionals are business-created; there is no self-serve onboarding, portfolio upload, or verification in this epic).

## Endpoints (API v1, authenticated)
- `GET /v1/professionals?cursor=&limit=` → `Page<ProfessionalSummary>` (cards: photo, rating, review count, price-from ₪, zone, ETA, availability).
- `GET /v1/professionals/:id` → `ProfessionalDetail` (bio, cover + profile photo, portfolio, full service catalog + prices, travel area, availability). 404 if not found/active.

## Data
`professional_profiles` (+ E3 presentation columns from migration 0003), `professional_services`, `professional_portfolio_media`, `service_areas`, `travel_zones`. Read-only here; write paths are future supply epics.

## Design
Deny-by-default `JwtAuthGuard` (reused from identity). Price-from is the lowest active service price (pure `domain/pricing.ts`, unit-tested). Cursor pagination via the shared api-contracts `Page<T>`. Prices are integer agorot; the client formats ₪ with `@barber-marketplace/i18n`.

## Verification
Pure `priceFromMinorUnits` — executed unit tests. Module — syntax-checked (0 real errors). Endpoints — e2e spec authored (`tests/e2e/professionals.e2e-spec.ts`), runs in the real env against a seeded Postgres.
