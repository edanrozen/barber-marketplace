import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidOtpCode } from './otp-code';

test('accepts a 6-digit code', () => assert.equal(isValidOtpCode('012345'), true));
test('rejects wrong length', () => {
  assert.equal(isValidOtpCode('12345'), false);
  assert.equal(isValidOtpCode('1234567'), false);
});
test('rejects non-digits', () => {
  assert.equal(isValidOtpCode('12a456'), false);
  assert.equal(isValidOtpCode(''), false);
});
