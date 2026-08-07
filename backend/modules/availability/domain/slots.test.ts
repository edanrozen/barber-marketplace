import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeDaySlotStarts, minutesToHHmm } from './slots';

test('basic slots fit inside a window', () => {
  assert.deepEqual(
    computeDaySlotStarts({ windows: [{ startMinutes: 540, endMinutes: 660 }], serviceDurationMinutes: 30, slotStepMinutes: 30, earliestStartMinutes: 0 }),
    [540, 570, 600, 630],
  );
});
test('service that does not fit yields no slots', () => {
  assert.deepEqual(computeDaySlotStarts({ windows: [{ startMinutes: 540, endMinutes: 560 }], serviceDurationMinutes: 30, slotStepMinutes: 15, earliestStartMinutes: 0 }), []);
});
test('earliestStartMinutes drops past/too-soon slots', () => {
  assert.deepEqual(
    computeDaySlotStarts({ windows: [{ startMinutes: 540, endMinutes: 660 }], serviceDurationMinutes: 30, slotStepMinutes: 30, earliestStartMinutes: 600 }),
    [600, 630],
  );
});
test('aligns to the step grid', () => {
  const s = computeDaySlotStarts({ windows: [{ startMinutes: 540, endMinutes: 660 }], serviceDurationMinutes: 30, slotStepMinutes: 15, earliestStartMinutes: 545 });
  assert.equal(s[0], 555);
});
test('multiple windows are merged, de-duped and sorted', () => {
  assert.deepEqual(
    computeDaySlotStarts({ windows: [{ startMinutes: 600, endMinutes: 660 }, { startMinutes: 540, endMinutes: 600 }], serviceDurationMinutes: 60, slotStepMinutes: 60, earliestStartMinutes: 0 }),
    [540, 600],
  );
});
test('minutesToHHmm formats correctly', () => {
  assert.equal(minutesToHHmm(540), '09:00');
  assert.equal(minutesToHHmm(5), '00:05');
  assert.equal(minutesToHHmm(1230), '20:30');
});
