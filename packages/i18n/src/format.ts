/** Israeli formatters. Deterministic (no ICU/locale-data dependency) so they are unit-testable. */

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));

/** dd/MM/yyyy */
export const formatDateIL = (date: Date): string =>
  `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;

/** HH:mm (24h) */
export const formatTimeIL = (date: Date): string => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

/** dd/MM/yyyy HH:mm */
export const formatDateTimeIL = (date: Date): string => `${formatDateIL(date)} ${formatTimeIL(date)}`;

/** Group an integer's digits with thousands separators. */
const groupThousands = (intDigits: string): string => intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Agorot (integer minor units) → "₪1,234.50". */
export const formatCurrencyILS = (minorUnits: number): string => {
  if (!Number.isInteger(minorUnits)) throw new RangeError('minorUnits must be an integer number of agorot');
  const negative = minorUnits < 0;
  const abs = Math.abs(minorUnits);
  const shekels = Math.floor(abs / 100);
  const agorot = abs % 100;
  return `${negative ? '-' : ''}₪${groupThousands(String(shekels))}.${pad2(agorot)}`;
};

/** E.164 (+9725XXXXXXXX) or local digits → display "05X-XXX-XXXX". Falls back to the input if unrecognized. */
export const formatPhoneIL = (input: string): string => {
  let digits = input.replace(/[\s\-()]/g, '');
  if (digits.startsWith('+972')) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith('972')) digits = `0${digits.slice(3)}`;
  if (/^05\d{8}$/.test(digits)) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return input;
};

export interface IsraeliAddress {
  street: string;
  houseNumber: string;
  city: string;
  postalCode?: string;
}
/** "רחוב 12, תל אביב-יפו" (+ postal code when present). */
export const formatAddressIL = (address: IsraeliAddress): string => {
  const line = `${address.street} ${address.houseNumber}, ${address.city}`;
  return address.postalCode !== undefined ? `${line} ${address.postalCode}` : line;
};
