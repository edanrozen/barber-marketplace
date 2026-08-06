import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceFromMinorUnits } from './pricing';

test('returns null when no active services', () => {
  assert.equal(priceFromMinorUnits([]), null);
  assert.equal(priceFromMinorUnits([{ priceMinorUnits: 8000, isActive: false }]), null);
});
test('returns the lowest active price', () => {
  assert.equal(
    priceFromMinorUnits([
      { priceMinorUnits: 11000, isActive: true },
      { priceMinorUnits: 8000, isActive: true },
      { priceMinorUnits: 4500, isActive: false },
      { priceMinorUnits: 6000, isActive: true },
    ]),
    6000,
  );
});
