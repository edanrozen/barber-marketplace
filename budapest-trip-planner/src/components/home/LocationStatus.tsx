import type { LocationSource } from '@/types';

const STATUS_TEXT: Record<LocationSource, string> = {
  live: '📍 המיקום שלך מעודכן',
  'last-known': '📍 משתמשים במיקום האחרון',
  fallback: '📍 מיקום משוער לפי הלו״ז',
  none: '📍 אין גישה למיקום',
};

/** Deliberately small and quiet — never a blocking banner, just a status hint. */
export function LocationStatus({ source }: { source: LocationSource }): JSX.Element {
  return <p className="text-xs text-ink-muted">{STATUS_TEXT[source]}</p>;
}
