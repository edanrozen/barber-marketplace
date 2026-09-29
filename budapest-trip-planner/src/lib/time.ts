import type { OpeningHours, Weekday } from '@/types';

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** The trip happens in Budapest; the phone might not be set to that timezone (planning ahead of time from home). Always read the clock via Europe/Budapest — this is THE "what time is it" helper the whole app uses. */
export function getCurrentTime(): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Budapest',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? 0);

  return new Date(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
}

export function weekdayOf(date: Date): Weekday {
  return WEEKDAYS[date.getDay()] as Weekday;
}

/** "HH:mm" -> minutes since midnight. */
export function parseHHMM(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToHHMM(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60)
    .toString()
    .padStart(2, '0');
  const m = (normalized % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function nowMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Wraps an extended-hour "HH:mm" (e.g. "24:00", "26:30") back to a normal clock display ("00:00", "02:30"). Storage/sorting keeps the extended form; only display goes through this. */
export function formatClockTime(value: string): string {
  return minutesToHHMM(parseHHMM(value));
}

/** "YYYY-MM-DD" from a Date's own local fields — never use `toISOString()` here, it UTC-shifts and can land on the wrong day. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Real opening-hours data is almost always partial (we might know Wed–Sat
 * but not the rest). A day with no key at all means "we don't know", not
 * "closed" — only an explicit range (or an explicit empty array for a
 * confirmed-closed day) counts as known. Callers must check this before
 * treating a missing day as closed, or every partially-known place would
 * silently read as closed on the days we simply have no data for.
 */
export function hasKnownHoursForDay(openingHours: OpeningHours, date: Date): boolean {
  return openingHours[weekdayOf(date)] !== undefined;
}

export function isOpenAt(openingHours: OpeningHours, date: Date): boolean {
  const day = weekdayOf(date);
  const ranges = openingHours[day];
  if (!ranges || ranges.length === 0) return false;

  const minutes = nowMinutes(date);
  return ranges.some((range) => {
    const open = parseHHMM(range.open);
    const close = parseHHMM(range.close);
    if (close > open) {
      return minutes >= open && minutes <= close;
    }
    // Crosses midnight (e.g. club open 22:00 -> 05:00).
    return minutes >= open || minutes <= close;
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} דק׳`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} שע׳`;
  return `${h} שע׳ ${m} דק׳`;
}
