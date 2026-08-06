# Professional Catalog (Sprint-2 E1 / MVP)

## What a customer can now do
Log in → **browse real Tel Aviv professionals** (photo, rating, review count, price-from ₪, zone, ETA, availability) → open a professional → see **cover + profile photo, bio, portfolio gallery, full service catalog with ₪ prices, travel area (zone + radius + ETA), and availability**. Hebrew, RTL. Booking is intentionally not yet available (a disabled "קביעת תור" hints the next epic).

## Seed supply
5 operational Tel Aviv professionals (`backend/database/seeds/0002_professionals.sql`), each with services, prices (agorot), portfolio images (deterministic picsum), rating/reviews, travel radius, ETA, and availability summary. Idempotent (fixed UUIDs + `ON CONFLICT DO NOTHING`).

## Run (real environment)
1. `npm install`; provision Postgres; set `DATABASE_URL`, `APP_JWT_SIGNING_KEY`, `OTP_PEPPER`.
2. Apply migrations `0001` → `0002` → `0003` (up), then seeds `0001` + `0002`.
3. Start the backend (`configureApp` activates URI versioning + error contract).
4. `apps/customer-mobile`: set `extra.apiBaseUrl`, `npm install`, `npx expo start`; log in (dev SMS prints the OTP), land on the browse list, open a professional.

## Verification status
Backend catalog logic (price-from) — executed unit tests. Module + e2e — authored, syntax-checked; e2e runs in real env against seeded Postgres. Mobile screens — authored; validated on a device/simulator.
