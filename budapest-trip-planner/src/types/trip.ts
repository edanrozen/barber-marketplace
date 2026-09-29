/**
 * The fixed skeleton of a day — flights, hotel check-in/out, paid bookings,
 * SPARTY-style locked commitments — plus the flexible/free windows the
 * recommendation engine is allowed to fill.
 */

export type ScheduleItemType =
  | 'FLIGHT'
  | 'HOTEL'
  | 'RESTAURANT'
  | 'ATTRACTION'
  | 'SHOPPING'
  | 'NIGHTLIFE'
  | 'TRANSPORT'
  | 'FREE_TIME'
  | 'OTHER';

export type ScheduleItemStatus = 'confirmed' | 'suggested' | 'flexible' | 'cancelled';

export interface ScheduleItem {
  id: string;
  /**
   * "HH:mm" 24h local time. Hours may exceed 23 (e.g. "24:00", "26:00") for
   * an item that clock-wise falls after midnight but conceptually belongs
   * to THIS day's night (SPARTY ending 02:00, a club starting at 00:00
   * right after this evening's plans) — that keeps it sorting correctly
   * after everything else in the same day's array without needing a
   * separate date field. Display code wraps it back to normal clock time.
   */
  startTime: string;
  /**
   * "HH:mm", same extended-hour convention as startTime. Omitted when the
   * real itinerary only gives a start time (most nightlife/restaurant
   * check-ins) — never invented. Schedule math falls back to the linked
   * place's estimatedDurationMinutes, then to a zero-length point event.
   */
  endTime?: string;
  title: string;
  type: ScheduleItemType;
  /** Links this slot to a catalog Place, when one applies. */
  placeId?: string;
  status: ScheduleItemStatus;
  /**
   * true = locked in, can't be moved or overwritten (flight, paid booking,
   * SPARTY, check-in/out time). false = flexible — can be rescheduled, or
   * replaced by a recommendation. A flexible item may never be saved so
   * that it overlaps a fixed one (enforced by the store, not just the UI).
   */
  fixed: boolean;
  notes?: string;
}

export interface TripDay {
  id: string;
  /** ISO date, e.g. "2026-10-03". */
  date: string;
  dayNumber: number;
  title?: string;
  scheduleItems: ScheduleItem[];
}

export interface TripPlan {
  destination: string;
  timezone: string;
  days: TripDay[];
}
