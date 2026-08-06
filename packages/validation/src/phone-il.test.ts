import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIsraeliMobile } from './phone-il';

test('normalizes local 05X to E.164', () => {
  const r = normalizeIsraeliMobile('054-123-4567');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.e164, '+972541234567');
});
test('accepts +972 and 972 prefixes', () => {
  assert.deepEqual(normalizeIsraeliMobile('+972541234567'), { ok: true, e164: '+972541234567' });
  assert.deepEqual(normalizeIsraeliMobile('972541234567'), { ok: true, e164: '+972541234567' });
});
test('strips spaces/dashes/parens', () => {
  const r = normalizeIsraeliMobile(' (054) 123 4567 ');
  assert.equal(r.ok && r.e164, '+972541234567');
});
test('rejects empty', () => assert.equal(normalizeIsraeliMobile('   ').ok, false));
test('rejects landline (non-mobile)', () => assert.equal(normalizeIsraeliMobile('03-123-4567').ok, false));
test('rejects garbage', () => assert.equal(normalizeIsraeliMobile('not-a-phone').ok, false));
