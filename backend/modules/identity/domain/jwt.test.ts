import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signHs256, verifyHs256 } from './jwt';

const secret = 's3cret-signing-key';
test('sign/verify roundtrip', () => {
  const now = 1000;
  const token = signHs256({ sub: 'u1', role: 'customer', iat: now, exp: now + 3600 }, secret);
  const v = verifyHs256(token, secret, now);
  assert.equal(v.ok, true);
  if (v.ok) {
    assert.equal(v.payload.sub, 'u1');
    assert.equal(v.payload.role, 'customer');
  }
});
test('rejects tampered payload (privilege escalation attempt)', () => {
  const now = 1000;
  const token = signHs256({ sub: 'u1', role: 'customer', iat: now, exp: now + 3600 }, secret);
  const parts = token.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'u1', role: 'admin', iat: now, exp: now + 3600 })).toString('base64url');
  assert.equal(verifyHs256(`${parts[0]}.${forged}.${parts[2]}`, secret, now).ok, false);
});
test('rejects wrong secret', () => {
  const now = 1000;
  const token = signHs256({ sub: 'u1', role: 'customer', iat: now, exp: now + 3600 }, secret);
  assert.equal(verifyHs256(token, 'other-secret', now).ok, false);
});
test('rejects expired token', () => {
  const token = signHs256({ sub: 'u1', role: 'customer', iat: 0, exp: 100 }, secret);
  assert.equal(verifyHs256(token, secret, 200).ok, false);
});
test('rejects malformed token', () => assert.equal(verifyHs256('abc', secret, 0).ok, false));
