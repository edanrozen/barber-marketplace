import type { Place, RecommendationContext } from '@/types';
import { getTravelTime } from '@/lib/distance';
import { isOpenAt } from '@/lib/time';
import { moodOption } from './moods';
import { MAX_REASONABLE_TRAVEL_MINUTES } from './types';

export interface TravelInfo {
  distanceKm: number | null;
  travelMinutes: number | null;
}

export function travelInfoFor(place: Place, ctx: RecommendationContext): TravelInfo {
  const from = ctx.currentLocation;
  if (!from || !place.coordinates) return { distanceKm: null, travelMinutes: null };

  const { minutes, distanceKm } = getTravelTime(from, place.coordinates);
  return { distanceKm, travelMinutes: minutes };
}

/**
 * Hours are treated as "unknown → allow" when the place has no entry at all
 * for today's weekday (we don't have the data yet), but "closed → exclude"
 * when there IS data and today just isn't in it.
 */
function passesOpeningHours(place: Place, ctx: RecommendationContext): boolean {
  const hasAnyHours = Object.keys(place.openingHours).length > 0;
  if (!hasAnyHours) return true;
  return isOpenAt(place.openingHours, ctx.currentTime);
}

function passesMood(place: Place, ctx: RecommendationContext): boolean {
  if (!ctx.mood || ctx.mood === 'surprise_me') return true;
  const option = moodOption(ctx.mood);
  if (!option || option.categories.length === 0) return true;

  const categoryMatch = option.categories.includes(place.category);
  // A place can also qualify by explicit moodTag even outside its category's
  // usual mood (e.g. a food market tagged 'hungry_light' despite being
  // category 'attraction') — moodTags is the more specific signal.
  const explicitMoodTagMatch = place.moodTags.includes(ctx.mood);
  return categoryMatch || explicitMoodTagMatch;
}

/**
 * Hard filters: candidates that fail any of these are not "a worse fit",
 * they're not options at all right now. Everything that survives goes on
 * to scoring.
 *
 * The time check is the important one added for the schedule-aware engine:
 * a place whose travel + visit time doesn't fit before the next fixed
 * commitment (`ctx.availableMinutes`, already buffer-trimmed) never reaches
 * scoring at all — it's not "a worse option", it's not reachable.
 */
export function filterCandidates(places: Place[], ctx: RecommendationContext): Place[] {
  return places.filter((place) => {
    if (place.status !== 'AVAILABLE') return false;
    if (ctx.excludeIds.includes(place.id)) return false;
    if (!passesMood(place, ctx)) return false;
    if (!passesOpeningHours(place, ctx)) return false;

    const { travelMinutes } = travelInfoFor(place, ctx);
    const travel = travelMinutes ?? 0;

    if (ctx.availableMinutes !== null && travel + place.estimatedDurationMinutes > ctx.availableMinutes) {
      return false;
    }
    if (travel > MAX_REASONABLE_TRAVEL_MINUTES) return false;

    return true;
  });
}
