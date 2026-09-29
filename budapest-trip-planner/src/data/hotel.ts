/**
 * The trip's home base. Not a `Place` in the catalog — there's no hotel
 * category, and it's not a spontaneous recommendation candidate — just a
 * verified reference point the location-resolution fallback chain
 * (`lib/geolocation.ts`) can fall back to when there's no GPS fix and no
 * active/next schedule item to anchor from.
 *
 * Address verified via multiple independent booking/travel listings
 * (Kazinczy utca 47, 1075 Budapest — Erzsébetváros / Jewish Quarter).
 * Coordinates verified via aggregator-site geodata (Phase 8) and
 * cross-checked against the already-verified coordinates for Mitico
 * Budapest (places.seed.ts), a separate real business at the same street
 * address — both independently resolve to the same building.
 */
export const HOTEL_MIKA = {
  name: 'Hotel Mika Downtown',
  location: 'Kazinczy utca 47, 1075 Budapest',
  coordinates: { lat: 47.499321, lng: 19.060921 },
} as const;
