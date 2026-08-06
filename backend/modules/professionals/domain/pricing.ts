/** Pure catalog helpers (unit-tested; no framework/db). */
export interface PricedService {
  readonly priceMinorUnits: number;
  readonly isActive: boolean;
}

/** Lowest active service price (the "price-from" shown on cards), or null if none active. */
export const priceFromMinorUnits = (services: readonly PricedService[]): number | null => {
  const active = services.filter((s) => s.isActive);
  const first = active[0];
  if (first === undefined) return null;
  return active.reduce((min, s) => (s.priceMinorUnits < min ? s.priceMinorUnits : min), first.priceMinorUnits);
};
