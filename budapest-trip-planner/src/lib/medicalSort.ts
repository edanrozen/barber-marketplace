import type { GeoCoordinates, Place } from '@/types';
import { getTravelTime } from './distance';

/**
 * Deliberately separate from `engine/scoring.ts` — medical facilities must
 * never go through mood/need/budget/energy scoring (see the safety
 * exclusion in `engine/filters.ts`). This is a plain, explainable sort:
 * for "מיון / חירום" it's emergency capability, then distance, then
 * currently-open/24h, then travel time (which — under our straight-line
 * walking estimate — is monotonic with distance, so it only breaks ties
 * distance itself can't, e.g. two places at the same distance).
 */
export function sortMedicalFacilities(
  facilities: Place[],
  currentLocation: GeoCoordinates | null,
  opts: { emergencyFirst: boolean },
): Place[] {
  const withTravel = facilities.map((place) => {
    const travel = currentLocation && place.coordinates ? getTravelTime(currentLocation, place.coordinates) : null;
    return { place, distanceKm: travel?.distanceKm ?? null, travelMinutes: travel?.minutes ?? null };
  });

  return withTravel
    .sort((a, b) => {
      if (opts.emergencyFirst) {
        const aEmergency = a.place.emergencyAvailable ? 1 : 0;
        const bEmergency = b.place.emergencyAvailable ? 1 : 0;
        if (aEmergency !== bEmergency) return bEmergency - aEmergency;
      }

      if (a.distanceKm === null && b.distanceKm !== null) return 1;
      if (a.distanceKm !== null && b.distanceKm === null) return -1;
      if (a.distanceKm !== null && b.distanceKm !== null && a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }

      const aOpen = a.place.open24Hours ? 1 : 0;
      const bOpen = b.place.open24Hours ? 1 : 0;
      if (aOpen !== bOpen) return bOpen - aOpen;

      if (a.travelMinutes === null && b.travelMinutes !== null) return 1;
      if (a.travelMinutes !== null && b.travelMinutes === null) return -1;
      if (a.travelMinutes !== null && b.travelMinutes !== null) return a.travelMinutes - b.travelMinutes;

      return 0;
    })
    .map((x) => x.place);
}
