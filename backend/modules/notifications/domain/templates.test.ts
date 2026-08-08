import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingConfirmed, bookingCancelled } from './templates';

const d = { professionalName: 'יוסי כהן', serviceName: 'תספורת גבר', date: '2026-08-10', start: '10:00' };

test('bookingConfirmed builds type + body with details', () => {
  const n = bookingConfirmed(d);
  assert.equal(n.type, 'booking_confirmed');
  assert.ok(n.body.includes('תספורת גבר'));
  assert.ok(n.body.includes('יוסי כהן'));
  assert.ok(n.body.includes('10:00'));
});
test('bookingCancelled builds cancellation type', () => {
  const n = bookingCancelled(d);
  assert.equal(n.type, 'booking_cancelled');
  assert.ok(n.title.length > 0);
});
