import type { TripPlan } from '@/types';
import { dateKey } from '@/lib/time';

/**
 * Intentionally empty schedule — no real hours, bookings or activities yet.
 * Replace `days` with the real itinerary once it's ready; only `fixed:
 * true` items (flights, paid bookings, SPARTY-style locked commitments)
 * need to be entered by hand — free time between them is computed
 * automatically (see `lib/tripSchedule.ts::computeFreeTimeBlocks`).
 */
export const TRIP_SEED: TripPlan = {
  destination: 'Budapest',
  timezone: 'Europe/Budapest',
  days: [
    {
      id: 'day-1',
      date: dateKey(new Date()),
      dayNumber: 1,
      scheduleItems: [],
    },
  ],
};
