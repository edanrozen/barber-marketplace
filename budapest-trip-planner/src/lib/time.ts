import type { OpeningHours, Weekday } from '@/types';

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** The trip happens in Budapest; the phone might not be set to that timezone (planning ahead of time from home). Always read the clock via Europe/Budapest. */
export function getBudapestNow(): Date {
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
