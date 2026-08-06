/** Israeli mobile phone normalization to E.164 (+9725XXXXXXXX). */
export interface PhoneOk { readonly ok: true; readonly e164: string }
export interface PhoneErr { readonly ok: false; readonly reason: 'empty' | 'format' | 'not_mobile' }
export type NormalizedPhone = PhoneOk | PhoneErr;

export const normalizeIsraeliMobile = (input: string): NormalizedPhone => {
  if (typeof input !== 'string') return { ok: false, reason: 'empty' };
  const trimmed = input.trim();
  if (trimmed.length === 0) return { ok: false, reason: 'empty' };

  let digits = trimmed.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+972')) {
    // already E.164
  } else if (digits.startsWith('972')) {
    digits = `+${digits}`;
  } else if (digits.startsWith('0')) {
    digits = `+972${digits.slice(1)}`;
  } else {
    return { ok: false, reason: 'format' };
  }

  if (!/^\+9725\d{8}$/.test(digits)) return { ok: false, reason: 'not_mobile' };
  return { ok: true, e164: digits };
};
