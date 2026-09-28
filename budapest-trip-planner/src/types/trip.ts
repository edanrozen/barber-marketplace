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
  /** "HH:mm" 24h local time. */
  startTime: string;
  /** "HH:mm" 24h local time. */
  endTime: string;
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
