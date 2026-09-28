/**
 * The fixed skeleton of a day — flights, bookings, meeting friends — plus the
 * open slots the recommendation engine is allowed to fill.
 */

export type ScheduleItemStatus = 'confirmed' | 'suggested' | 'flexible' | 'cancelled';

export type ScheduleItemType = 'fixed' | 'free_time';

export interface ScheduleItem {
  id: string;
  /** "HH:mm" 24h local time this block starts. */
  time: string;
  title: string;
  /** Set once the engine (or the user) has attached a concrete Place to this slot. */
  placeId?: string;
  status: ScheduleItemStatus;
  type: ScheduleItemType;
  /** Only meaningful for `free_time` blocks; how long the window is open. */
  durationMinutes?: number;
  notes?: string;
}

export interface TripDay {
  /** ISO date, e.g. "2026-10-14". */
  date: string;
  dayNumber: number;
  schedule: ScheduleItem[];
}

export interface TripPlan {
  destination: string;
  timezone: string;
  days: TripDay[];
}
