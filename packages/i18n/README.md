# @barber-marketplace/i18n

Single source of truth for user-facing strings and Israeli formatting. Hebrew-first, RTL, add-locale-ready.

## Exports
- **Locale**: `LOCALES`, `Locale`, `DEFAULT_LOCALE` (`he`), `isRtlLocale`.
- **Catalog**: `getCatalog`, `StringKey` (key set is derived from the Hebrew catalog).
- **Translate**: `t(key)`, `setLocale`, `getLocale`.
- **Formatters (IL)**: `formatDateIL`, `formatTimeIL`, `formatDateTimeIL`, `formatCurrencyILS` (agorot → ₪), `formatPhoneIL`, `formatAddressIL`.

## Adding a locale (config, not rework)
1. Add the code to `LOCALES` in `locale.ts`.
2. Add `catalogs/<locale>.ts` with the **same keys** as `catalogs/he.ts`.
3. Register it in `catalog.ts`. No consumer changes required.

## No hard-coded strings
Client UI must resolve every user-facing string via `t()`. CI enforces this with
`scripts/check-no-hardcoded-strings.mjs` (`npm run check:i18n`).

## Verification
Formatters + translate resolver are covered by executable unit tests (`*.test.ts`, run green).
