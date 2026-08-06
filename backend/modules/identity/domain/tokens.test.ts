import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRefreshToken, hashRefreshToken, evaluateRefresh } from './tokens';

test('refresh token is opaque + hash is stable', () => {
  const t = generateRefreshToken();
  assert.match(t, /^[A-Za-z0-9_-]+$/);
  assert.equal(hashRefreshToken(t), hashRefreshToken(t));
  assert.notEqual(hashRefreshToken(t), t);
});
test('unused valid token rotates', () => {
  assert.deepEqual(
    evaluateRefresh({ tokenHash: 'h', familyId: 'f', usedAt: null, revokedAt: null, expiresAt: 2000 }, 1000),
    { action: 'rotate', familyId: 'f' },
  );
});
test('already-used token triggers reuse detection (family revoke)', () => {
  assert.deepEqual(
    evaluateRefresh({ tokenHash: 'h', familyId: 'f', usedAt: 900, revokedAt: null, expiresAt: 2000 }, 1000),
    { action: 'reuse_detected', familyId: 'f' },
  );
});
test('revoked/expired/missing are rejected', () => {
  assert.equal(evaluateRefresh({ tokenHash: 'h', familyId: 'f', usedAt: null, revokedAt: 950, expiresAt: 2000 }, 1000).action, 'reject');
  assert.equal(evaluateRefresh({ tokenHash: 'h', familyId: 'f', usedAt: null, revokedAt: null, expiresAt: 500 }, 1000).action, 'reject');
  assert.equal(evaluateRefresh(null, 1000).action, 'reject');
});
