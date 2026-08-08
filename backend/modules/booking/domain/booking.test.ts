import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canCancel } from './booking';

test('only confirmed bookings can be cancelled', () => {
  assert.equal(canCancel('confirmed'), true);
  assert.equal(canCancel('cancelled'), false);
  assert.equal(canCancel('completed'), false);
});
