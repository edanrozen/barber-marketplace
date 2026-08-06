import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateOtpCode, hashOtp, verifyOtpHash, checkOtp, canResend, OTP_MAX_ATTEMPTS } from './otp';

test('generateOtpCode is exactly 6 digits', () => assert.match(generateOtpCode(), /^\d{6}$/));
test('hash/verify roundtrip is phone-bound', () => {
  const h = hashOtp('123456', '+972541234567', 'pepper');
  assert.equal(verifyOtpHash('123456', '+972541234567', 'pepper', h), true);
  assert.equal(verifyOtpHash('654321', '+972541234567', 'pepper', h), false);
  assert.equal(verifyOtpHash('123456', '+972500000000', 'pepper', h), false);
});
test('checkOtp state machine', () => {
  const now = 1000;
  assert.equal(checkOtp({ attempts: 0, expiresAt: 2000, consumed: false }, now, true).ok, true);
  assert.equal(checkOtp({ attempts: 0, expiresAt: 500, consumed: false }, now, true).ok, false);
  assert.equal(checkOtp({ attempts: 0, expiresAt: 2000, consumed: true }, now, true).ok, false);
  assert.equal(checkOtp({ attempts: OTP_MAX_ATTEMPTS, expiresAt: 2000, consumed: false }, now, true).ok, false);
  assert.equal(checkOtp({ attempts: 0, expiresAt: 2000, consumed: false }, now, false).ok, false);
});
test('resend cooldown enforced', () => {
  assert.equal(canResend(1000, 1010), false);
  assert.equal(canResend(1000, 1040), true);
});
