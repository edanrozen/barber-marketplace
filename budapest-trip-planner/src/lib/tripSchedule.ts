import type { ScheduleItem, TripDay } from '@/types';
import { parseHHMM } from './time';

export interface NextActivityInfo {
  next: ScheduleItem | null;
  /** Minutes between `nowMinutes` and the next non-cancelled fixed/suggested item's start. null if nothing left today. */
  minutesUntilNext: number | null;
}

/** Finds the next confirmed/suggested item starting after `nowMinutes`. Free-time blocks and cancelled items never block availability. */
export function findNextActivity(day: TripDay | undefined, nowMinutes: number): NextActivityInfo {
  if (!day) return { next: null, minutesUntilNext: null };

  const upcoming = day.schedule
    .filter((item) => item.type === 'fixed' && item.status !== 'cancelled')
    .map((item) => ({ item, start: parseHHMM(item.time) }))
    .filter(({ start }) => start >= nowMinutes)
    .sort((a, b) => a.start - b.start);

  const first = upcoming[0];
  if (!first) return { next: null, minutesUntilNext: null };

  return { next: first.item, minutesUntilNext: first.start - nowMinutes };
}

const DEFAULT_DAY_END_MINUTES = 24 * 60;

/** How much runway is available right now before the next fixed commitment (or end of day). */
export function timeAvailableMinutes(day: TripDay | undefined, nowMinutes: number): number {
  const { minutesUntilNext } = findNextActivity(day, nowMinutes);
  if (minutesUntilNext === null) return Math.max(DEFAULT_DAY_END_MINUTES - nowMinutes, 0);
  return Math.max(minutesUntilNext, 0);
}

export function sortedSchedule(day: TripDay): ScheduleItem[] {
  return [...day.schedule].sort((a, b) => parseHHMM(a.time) - parseHHMM(b.time));
}
