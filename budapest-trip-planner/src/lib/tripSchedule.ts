import type { Place, ScheduleItem, TripDay } from '@/types';
import { dateKey, nowMinutes, parseHHMM } from './time';
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

function placeFor(places: Place[], item: ScheduleItem): Place | undefined {
  return item.placeId ? places.find((p) => p.id === item.placeId) : undefined;
}

/**
 * Real itineraries mostly give a single check-in time for nightlife/meals
 * ("21:00 — Szimpla Kert") with no explicit end — never invented. Falls
 * back to the linked place's own estimatedDurationMinutes (a real,
 * documented estimate already in the catalog, not a new guess), and only
 * to a zero-length point event when neither an end time nor a place is
 * known.
 */
function effectiveEndMinutes(item: ScheduleItem, places: Place[]): number {
  if (item.endTime) return parseHHMM(item.endTime);
  const place = placeFor(places, item);
  if (place) return itemStart(item) + place.estimatedDurationMinutes;
  return itemStart(item);
}

/**
 * Deliberately NOT the same as effectiveEndMinutes: overlap detection only
 * trusts an END TIME actually given, not a place's generic estimated
 * duration. Two point check-ins ("22:45 Jardín", "00:00 Casino") aren't a
 * real overlap just because Jardín's typical visit runs a bit past
 * midnight in the abstract — that's the itinerary's own intent (go until
 * the next thing), not a scheduling error. The realistic estimate stays
 * reserved for finding genuine free time between two commitments.
 */
function conservativeEndMinutes(item: ScheduleItem): number {
  return item.endTime ? parseHHMM(item.endTime) : itemStart(item);
}

export function sortedItems(day: TripDay): ScheduleItem[] {
  return [...day.scheduleItems].sort((a, b) => itemStart(a) - itemStart(b));
}

function activeFixedItems(day: TripDay): ScheduleItem[] {
  return sortedItems(day).filter((item) => item.fixed && item.status !== 'cancelled');
}

function activeItems(day: TripDay): ScheduleItem[] {
  return sortedItems(day).filter((item) => item.status !== 'cancelled');
}

/**
 * `day`'s items may use extended hours ("24:00"+) for a night that spills
 * past midnight while still living in the PREVIOUS calendar day's array.
 * Every "is this next/current/past" comparison against that day needs
 * `now` expressed in the SAME frame: if `day` really is yesterday relative
 * to `now`, shift now forward by a full day so e.g. SPARTY (21:30–26:00,
 * stored under Oct 3) still reads as "already happened" at 01:00 on what
 * the wall clock calls Oct 4, not "22 hours away". A day fully in the past
 * reports nothing as upcoming; a day fully in the future reports
 * everything as upcoming.
 */
export function referenceMinutesFor(day: TripDay, now: Date): number {
  const today = dateKey(now);
  if (day.date === today) return nowMinutes(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (day.date === dateKey(yesterday)) return nowMinutes(now) + 1440;

  return day.date < today ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
}

/** The next fixed commitment starting after `nowMinutes`. An item that already started is never "next" (it's current, or past). */
export function findNextFixedItem(day: TripDay, nowMinutes: number): ScheduleItem | null {
  return activeFixedItems(day).find((item) => itemStart(item) > nowMinutes) ?? null;
}

/**
 * The item (fixed or flexible) actively happening right now, if any. When
 * two items' windows both cover `nowMinutes` — which happens when an
 * earlier item's ESTIMATED duration (a guess, e.g. "Warm Up ~90min") runs a
 * little past a later item's REAL, explicit start (e.g. SPARTY at 21:30) —
 * the one that started more recently wins: it has an actual confirmed
 * start time that has passed, which is strictly more real than the earlier
 * item's guessed end time still technically covering the clock.
 */
export function findCurrentItem(day: TripDay, nowMinutes: number, places: Place[]): ScheduleItem | null {
  const matches = activeItems(day).filter(
    (item) => itemStart(item) <= nowMinutes && nowMinutes < effectiveEndMinutes(item, places),
  );
  if (matches.length === 0) return null;
  return matches.reduce((latest, item) => (itemStart(item) > itemStart(latest) ? item : latest));
}

/** Same as findCurrentItem, but only a FIXED item counts — being "in" a flexible block (e.g. a named-but-open sightseeing window) never blocks a spontaneous recommendation the way an ongoing locked commitment does. */
export function findCurrentFixedItem(day: TripDay, nowMinutes: number, places: Place[]): ScheduleItem | null {
  const current = findCurrentItem(day, nowMinutes, places);
  return current?.fixed ? current : null;
}

export interface FreeTimeBlock {
  id: string;
  /** The raw gap between the two bounding items — what the timeline displays ("12:00–17:00, 5 hours free"). */
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

/**
 * Gaps between ANY two consecutive non-cancelled items — fixed or
 * flexible. A flexible item (e.g. a named-but-open "Central Budapest
 * exploration" block) still occupies its own stated time on today's plan,
 * so free time is never double-counted on top of it; only the truly empty
 * space around it is real free time. Nothing is synthesized before the
 * first item or after the last one: that would require assuming the day
 * starts at 00:00 or ends at 23:59, which doesn't hold on arrival/
 * departure days.
 */
export function computeFreeTimeBlocks(day: TripDay, places: Place[]): FreeTimeBlock[] {
  const items = activeItems(day);
  const blocks: FreeTimeBlock[] = [];

  for (let i = 0; i < items.length - 1; i++) {
    const prev = items[i];
    const next = items[i + 1];
    if (!prev || !next) continue;

    const rawStartMinutes = effectiveEndMinutes(prev, places);
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
    if (usableDurationMinutes <= 0) continue; // fully consumed by buffer/travel — not worth showing

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
  const items = activeItems(day);

  for (const item of items) {
    // Only a real conflict when an explicit end was given and it's before the start — a missing end is never "bad", it just falls back.
    if (item.endTime && parseHHMM(item.endTime) <= itemStart(item)) {
      conflicts.push({
        id: `bad-range-${item.id}`,
        severity: 'error',
        message: `"${item.title}": שעת הסיום לא אחרי שעת ההתחלה.`,
        itemIds: [item.id],
      });
    }

    const place = placeFor(places, item);
    if (place && item.endTime && parseHHMM(item.endTime) - itemStart(item) < place.estimatedDurationMinutes) {
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
      const aEnd = conservativeEndMinutes(a);
      const bEnd = conservativeEndMinutes(b);
      if (itemStart(b) < aEnd && itemStart(a) < bEnd) {
        conflicts.push({
          id: `overlap-${a.id}-${b.id}`,
          severity: 'error',
          message: `"${a.title}" ו-"${b.title}" חופפים בזמן.`,
          itemIds: [a.id, b.id],
        });
      }
    }
  }

  for (let i = 0; i < items.length - 1; i++) {
    const prev = items[i];
    const next = items[i + 1];
    if (!prev || !next) continue;

    const gap = itemStart(next) - effectiveEndMinutes(prev, places);
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
