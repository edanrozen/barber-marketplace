import type { Place } from '@/types';
import { estimateWalkMinutes, haversineKm } from '@/lib/distance';
import { isOpenAt } from '@/lib/time';
import { moodOption } from './moods';
import { MAX_REASONABLE_TRAVEL_MINUTES, type EngineContext } from './types';

export interface TravelInfo {
  distanceKm: number | null;
  travelMinutes: number | null;
}

export function travelInfoFor(place: Place, ctx: EngineContext): TravelInfo {
  const from = ctx.userState.currentLocation;
  if (!from) return { distanceKm: null, travelMinutes: null };

  const distanceKm = haversineKm(from, place.coordinates);
  return { distanceKm, travelMinutes: estimateWalkMinutes(distanceKm) };
}

/**
 * Hours are treated as "unknown → allow" when the place has no entry at all
 * for today's weekday (we don't have the data yet), but "closed → exclude"
 * when there IS data and today just isn't in it.
 */
function passesOpeningHours(place: Place, ctx: EngineContext): boolean {
  const hasAnyHours = Object.keys(place.openingHours).length > 0;
  if (!hasAnyHours) return true;
  return isOpenAt(place.openingHours, ctx.now);
}

function passesMood(place: Place, ctx: EngineContext): boolean {
  if (!ctx.mood || ctx.mood === 'surprise_me') return true;
  const option = moodOption(ctx.mood);
  if (!option || option.categories.length === 0) return true;
  return option.categories.includes(place.category);
}

/**
 * Hard filters: candidates that fail any of these are not "a worse fit",
 * they're not options at all right now. Everything that survives goes on
 * to scoring.
 */
export function filterCandidates(places: Place[], ctx: EngineContext): Place[] {
  return places.filter((place) => {
    if (place.status !== 'AVAILABLE') return false;
    if (ctx.excludeIds.includes(place.id)) return false;
    if (!passesMood(place, ctx)) return false;
    if (!passesOpeningHours(place, ctx)) return false;

    const { travelMinutes } = travelInfoFor(place, ctx);
    if (travelMinutes !== null) {
      if (ctx.timeAvailableMinutes !== null && travelMinutes > ctx.timeAvailableMinutes) return false;
      if (travelMinutes > MAX_REASONABLE_TRAVEL_MINUTES) return false;
    }

    return true;
  });
}
