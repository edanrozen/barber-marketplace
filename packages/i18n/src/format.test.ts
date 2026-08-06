import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDateIL, formatTimeIL, formatDateTimeIL, formatCurrencyILS, formatPhoneIL, formatAddressIL } from './format';

test('date/time formatters (IL)', () => {
  const d = new Date(2026, 0, 5, 9, 3);
  assert.equal(formatDateIL(d), '05/01/2026');
  assert.equal(formatTimeIL(d), '09:03');
  assert.equal(formatDateTimeIL(d), '05/01/2026 09:03');
});
test('currency ₪ from agorot with grouping', () => {
  assert.equal(formatCurrencyILS(123450), '₪1,234.50');
  assert.equal(formatCurrencyILS(5), '₪0.05');
  assert.equal(formatCurrencyILS(1000000), '₪10,000.00');
  assert.equal(formatCurrencyILS(-100), '-₪1.00');
  assert.throws(() => formatCurrencyILS(1.5));
});
test('phone formatter (E.164 + local)', () => {
  assert.equal(formatPhoneIL('+972541234567'), '054-123-4567');
  assert.equal(formatPhoneIL('0541234567'), '054-123-4567');
  assert.equal(formatPhoneIL('not-a-phone'), 'not-a-phone');
});
test('address formatter', () => {
  assert.equal(formatAddressIL({ street: 'רחוב', houseNumber: '12', city: 'תל אביב-יפו' }), 'רחוב 12, תל אביב-יפו');
  assert.equal(formatAddressIL({ street: 'רחוב', houseNumber: '12', city: 'תל אביב-יפו', postalCode: '6100000' }), 'רחוב 12, תל אביב-יפו 6100000');
});
