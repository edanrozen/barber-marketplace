import type { Place } from '@/types';

/**
 * Intentionally empty. No real Budapest places have been entered yet —
 * per the brief, the app must not invent data. Add real places here (or
 * wire up an import screen later) and the whole app — catalog, filters,
 * recommendation engine, trip schedule — lights up automatically.
 *
 * Shape reference (delete once real data exists):
 *
 * const example: Place = {
 *   id: 'jardin-cocktail-bar',
 *   name: 'Jardín Cocktail Bar',
 *   category: 'bar',
 *   description: '...',
 *   location: 'Ráday utca, District IX',
 *   coordinates: { lat: 47.4869, lng: 19.0602 },
 *   openingHours: { thu: [{ open: '18:00', close: '02:00' }] },
 *   priceLevel: 3,
 *   estimatedDurationMinutes: 90,
 *   indoorOutdoor: 'both',
 *   tags: ['cocktails', 'design'],
 *   moodTags: ['drink'],
 *   energyRequired: 2,
 *   groupSuitability: ['couple', 'friends'],
 *   requiresBooking: false,
 *   visited: false,
 *   status: 'AVAILABLE',
 * };
 */
export const PLACES_SEED: Place[] = [];
