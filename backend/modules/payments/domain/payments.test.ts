import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, initialStatus, isSupportedMethod, PAYMENT_METHODS } from './payments';

test('only cash is supported for the MVP; card/bit are reserved', () => {
  assert.equal(isSupportedMethod('cash'), true);
  assert.equal(isSupportedMethod('card'), false);
  assert.equal(isSupportedMethod('bit'), false);
  assert.deepEqual([...PAYMENT_METHODS], ['cash', 'card', 'bit']);
});
test('cash initiates as pending', () => assert.equal(initialStatus('cash'), 'pending'));
test('status transitions', () => {
  assert.equal(canTransition('pending', 'paid'), true);
  assert.equal(canTransition('pending', 'cancelled'), true);
  assert.equal(canTransition('paid', 'refunded'), true);
  assert.equal(canTransition('paid', 'pending'), false);
  assert.equal(canTransition('cancelled', 'paid'), false);
});
