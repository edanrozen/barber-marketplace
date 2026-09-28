import type { Place, ScheduleItem, TripDay } from '@/types';
import { parseHHMM } from './time';
import { getTravelTime } from './distance';

/**
 * Flat grace period applied on either side of a schedule gap before it
 * counts as usable free time — covers "wrapping up" the previous thing and
 * "getting moving" for the next one. Confirmed by the brief's own worked
 * example (18:00 activity, 25min travel, 17:25 recommended departure —
 * 18:00 − 25 − 10 = 17:25).
 */
export const SAFETY_BUFFER_MINUTES = 10;

function itemStart(item: ScheduleItem): number {
  return parseHHMM(item.startTime);
}
function itemEnd(item: ScheduleItem): number {
  return parseHHMM(item.endTime);
}

export function sortedItems(day: TripDay): ScheduleItem[] {
  return [...day.scheduleItems].sort((a, b) => itemStart(a) - itemStart(b));
}

function activeFixedItems(day: TripDay): ScheduleItem[] {
  return sortedItems(day).filter((item) => item.fixed && item.status !== 'cancelled');
}

/** The next fixed commitment starting after `nowMinutes`. An item that already started is never "next" (it's current, or past). */
export function findNextFixedItem(day: TripDay, nowMinutes: number): ScheduleItem | null {
  return activeFixedItems(day).find((item) => itemStart(item) > nowMinutes) ?? null;
}

/** The item (fixed or flexible) actively happening right now, if any. */
export function findCurrentItem(day: TripDay, nowMinutes: number): ScheduleItem | null {
  return (
    sortedItems(day).find(
      (item) => item.status !== 'cancelled' && itemStart(item) <= nowMinutes && nowMinutes < itemEnd(item),
    ) ?? null
  );
}

export interface FreeTimeBlock {
  id: string;
  /** The raw gap between the two bounding fixed items — what the timeline displays ("12:00–17:00, 5 hours free"). */
  rawStartMinutes: number;
  rawEndMinutes: number;
  rawDurationMinutes: number;
  /** Buffer-trimmed window actually safe to fill with a new activity. */
  usableStartMinutes: number;
  usableEndMinutes: number;
  usableDurationMinutes: number;
  beforeItemId: string;
  afterItemId: string;
}

function placeFor(places: Place[], item: ScheduleItem): Place | undefined {
  return item.placeId ? places.find((p) => p.id === item.placeId) : undefined;
}

/**
 * Gaps between consecutive FIXED items only — flexible items don't block
 * free time detection since they can themselves be moved into it. Nothing
 * is synthesized before the first fixed item or after the last one: that
 * would require assuming the day starts at 00:00 or ends at 23:59, which
 * doesn't hold on arrival/departure days.
 */
export function computeFreeTimeBlocks(day: TripDay, places: Place[]): FreeTimeBlock[] {
  const fixed = activeFixedItems(day);
  const blocks: FreeTimeBlock[] = [];

  for (let i = 0; i < fixed.length - 1; i++) {
    const prev = fixed[i];
    const next = fixed[i + 1];
    if (!prev || !next) continue;

    const rawStartMinutes = itemEnd(prev);
    const rawEndMinutes = itemStart(next);
    const rawDurationMinutes = rawEndMinutes - rawStartMinutes;
    if (rawDurationMinutes <= 0) continue; // back-to-back or overlapping — no gap to fill

    const prevPlace = placeFor(places, prev);
    const nextPlace = placeFor(places, next);
    const travelBetween =
      prevPlace?.coordinates && nextPlace?.coordinates
        ? getTravelTime(prevPlace.coordinates, nextPlace.coordinates).minutes
        : 0;

    const usableStartMinutes = rawStartMinutes + SAFETY_BUFFER_MINUTES;
    const usableEndMinutes = rawEndMinutes - SAFETY_BUFFER_MINUTES - travelBetween;
    const usableDurationMinutes = Math.max(usableEndMinutes - usableStartMinutes, 0);

    blocks.push({
      id: `free_${prev.id}_${next.id}`,
      rawStartMinutes,
      rawEndMinutes,
      rawDurationMinutes,
      usableStartMinutes,
      usableEndMinutes,
      usableDurationMinutes,
      beforeItemId: prev.id,
      afterItemId: next.id,
    });
  }

  return blocks;
}

export interface ScheduleConflict {
  id: string;
  severity: 'warning' | 'error';
  message: string;
  itemIds: string[];
}

/**
 * Structural problems in a day's schedule: overlaps, travel that doesn't
 * fit in the gap, and flexible items given less time than their linked
 * place is estimated to need.
 */
export function detectScheduleConflicts(day: TripDay, places: Place[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const items = sortedItems(day).filter((item) => item.status !== 'cancelled');

  for (const item of items) {
    if (itemEnd(item) <= itemStart(item)) {
      conflicts.push({
        id: `bad-range-${item.id}`,
        severity: 'error',
        message: `"${item.title}": שעת הסיום לא אחרי שעת ההתחלה.`,
        itemIds: [item.id],
      });
    }

    const place = placeFor(places, item);
    if (place && itemEnd(item) - itemStart(item) < place.estimatedDurationMinutes) {
      conflicts.push({
        id: `too-short-${item.id}`,
        severity: 'warning',
        message: `הזמן שהוקצה ל"${item.title}" קצר מהזמן המשוער הדרוש (${place.estimatedDurationMinutes} דק׳).`,
        itemIds: [item.id],
      });
    }
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (!a || !b) continue;
      if (itemStart(b) < itemEnd(a) && itemStart(a) < itemEnd(b)) {
        conflicts.push({
          id: `overlap-${a.id}-${b.id}`,
          severity: 'error',
          message: `"${a.title}" ו-"${b.title}" חופפים בזמן.`,
          itemIds: [a.id, b.id],
        });
      }
    }
  }

  const fixed = activeFixedItems(day);
  for (let i = 0; i < fixed.length - 1; i++) {
    const prev = fixed[i];
    const next = fixed[i + 1];
    if (!prev || !next) continue;

    const gap = itemStart(next) - itemEnd(prev);
    if (gap < 0) continue; // already reported as an overlap above

    const prevPlace = placeFor(places, prev);
    const nextPlace = placeFor(places, next);
    if (!prevPlace?.coordinates || !nextPlace?.coordinates) continue;

    const travel = getTravelTime(prevPlace.coordinates, nextPlace.coordinates).minutes;
    if (gap < travel) {
      conflicts.push({
        id: `impossible-travel-${prev.id}-${next.id}`,
        severity: 'error',
        message: `אין מספיק זמן להגיע מ-${prevPlace.name} ל-${nextPlace.name} (${travel} דק׳ נסיעה, ${gap} דק׳ פנויות).`,
        itemIds: [prev.id, next.id],
      });
    } else if (gap < travel + SAFETY_BUFFER_MINUTES) {
      conflicts.push({
        id: `tight-travel-${prev.id}-${next.id}`,
        severity: 'warning',
        message: `המעבר מ-${prevPlace.name} ל-${nextPlace.name} לוחץ בזמן (${travel} דק׳ נסיעה, כמעט בלי buffer).`,
        itemIds: [prev.id, next.id],
      });
    }
  }

  return conflicts;
}
