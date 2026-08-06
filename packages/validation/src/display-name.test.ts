import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDisplayName } from './display-name';

test('accepts a Hebrew name and trims', () => {
  const r = validateDisplayName('  דנה כהן  ');
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value, 'דנה כהן');
});
test('rejects empty/whitespace', () => assert.equal(validateDisplayName('   ').ok, false));
test('rejects too long (>60)', () => assert.equal(validateDisplayName('x'.repeat(61)).ok, false));
test('rejects control characters', () => assert.equal(validateDisplayName('bad\u0001name').ok, false));
