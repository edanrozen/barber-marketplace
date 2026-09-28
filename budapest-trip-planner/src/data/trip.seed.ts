import type { TripPlan } from '@/types';

/**
 * Intentionally minimal placeholder trip. Replace `days` with the real
 * itinerary — the engine only needs `fixed` items (real commitments) and
 * `free_time` items (windows it's allowed to fill).
 */
export const TRIP_SEED: TripPlan = {
  destination: 'Budapest',
  timezone: 'Europe/Budapest',
  days: [
    {
      date: new Date().toISOString().slice(0, 10),
      dayNumber: 1,
      schedule: [],
    },
  ],
};
