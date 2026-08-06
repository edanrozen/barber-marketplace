/** Money is ALWAYS integer minor units (agorot for ILS) — never floats (ADR-002, ledger invariant). */
export type CurrencyCode = 'ILS';

export interface Money {
  readonly minorUnits: number;
  readonly currency: CurrencyCode;
}

export const ils = (minorUnits: number): Money => {
  if (!Number.isInteger(minorUnits)) {
    throw new RangeError('Money.minorUnits must be an integer number of agorot');
  }
  return { minorUnits, currency: 'ILS' };
};

export const isMoney = (value: unknown): value is Money => {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return Number.isInteger(m['minorUnits']) && m['currency'] === 'ILS';
};
