/** Display-name validation (Hebrew-friendly; rejects control characters). */
export const DISPLAY_NAME_MIN = 1;
export const DISPLAY_NAME_MAX = 60;
export interface NameOk { readonly ok: true; readonly value: string }
export interface NameErr { readonly ok: false; readonly reason: 'empty' | 'too_long' | 'invalid' }

export const validateDisplayName = (input: string): NameOk | NameErr => {
  if (typeof input !== 'string') return { ok: false, reason: 'empty' };
  const value = input.trim();
  if (value.length < DISPLAY_NAME_MIN) return { ok: false, reason: 'empty' };
  if (value.length > DISPLAY_NAME_MAX) return { ok: false, reason: 'too_long' };
  // Reject C0/C1 control chars (allow all printable incl. Hebrew).
  for (let i = 0; i < value.length; i += 1) {
    const c = value.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) return { ok: false, reason: 'invalid' };
  }
  return { ok: true, value };
};
