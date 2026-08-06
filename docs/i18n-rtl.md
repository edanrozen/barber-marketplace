# i18n & RTL (E6)

## Delivered
- Shared `@barber-marketplace/i18n`: locale abstraction (Hebrew default, add-locale-ready), Hebrew catalog, Israeli formatters (date/time/phone/₪/address) — unit-tested.
- Customer app consumes the shared catalog via `t()`; no local string dictionary; RTL forced via `I18nManager`.
- CI gate fails the build on any hard-coded user-facing string (`npm run check:i18n`).

## Blocked / deferred to E11 (app shells)
- **RTL for the barber and admin clients** (S6.2 T6.2.2/T6.2.3): `apps/barber-mobile` and `apps/admin-web` are still empty shells. Their RTL layout + catalog wiring lands when the shells are built in E11; they will consume the same `@barber-marketplace/i18n` package (no new work in the shared layer).

## Verification status
Shared package: executed unit tests pass. Mobile consumption + RTL rendering: authored; validated on a device/simulator in the real environment (no Expo/RN runtime in this sandbox).
