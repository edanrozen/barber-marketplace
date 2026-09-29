import type { Place, RecommendationContext, ScoreFactor, ScoredPlace } from '@/types';
import { travelInfoFor } from './filters';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function moodMatchFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 20;
  if (!ctx.mood || ctx.mood === 'surprise_me') {
    return { key: 'mood', label: 'התאמה למצב', points: maxPoints * 0.6, maxPoints };
  }
  const points = place.moodTags.includes(ctx.mood) ? maxPoints : maxPoints * 0.5;
  return { key: 'mood', label: 'התאמה למצב', points, maxPoints };
}

function needFitFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 10;

  // A place's CATEGORY is the usual signal, but an explicit moodTag (e.g. a
  // shopping district that's really a bar-crawl strip, tagged 'drink') is
  // the more specific one — see filters.ts's `passesMood`, which already
  // treats moodTags as equally valid grounds to qualify. Scoring must agree:
  // otherwise a place that only qualifies via category default (0.5) can
  // outscore a real bar/restaurant whenever hunger/thirst sits below the
  // formula's midpoint, which is backwards for a mood the user just picked.
  const isFoodLike =
    place.category === 'food' ||
    place.category === 'cafe' ||
    place.moodTags.includes('hungry_light') ||
    place.moodTags.includes('hungry_a_lot') ||
    place.moodTags.includes('coffee_sweet');
  const isDrinkLike = place.category === 'bar' || place.category === 'club' || place.moodTags.includes('drink');

  let points = maxPoints * 0.5;
  if (isFoodLike) {
    // When we know exactly how hungry this place is meant for (a dessert
    // stop vs. an all-you-can-eat dinner), score the gap directly instead
    // of treating every food/cafe place as interchangeable.
    points =
      place.hungerFit !== undefined
        ? maxPoints * clamp(1 - Math.abs(place.hungerFit - ctx.hungerLevel) / 3, 0, 1)
        : maxPoints * (ctx.hungerLevel / 3);
  } else if (isDrinkLike) {
    points = maxPoints * (ctx.thirstLevel / 3);
  }
  return { key: 'need', label: 'התאמה לרעב/צמא', points, maxPoints };
}

function distanceFitFactor(travelMinutes: number | null): ScoreFactor {
  const maxPoints = 15;
  if (travelMinutes === null) return { key: 'distance', label: 'מרחק', points: maxPoints * 0.5, maxPoints };
  const points = maxPoints * clamp(1 - travelMinutes / 30, 0, 1);
  return { key: 'distance', label: 'מרחק', points, maxPoints };
}

/**
 * `filterCandidates` already guarantees anything reaching scoring fits
 * within `ctx.availableMinutes` — this factor differentiates HOW
 * comfortably it fits (half credit for barely making it, full credit for
 * plenty of margin), rather than a pass/fail check.
 */
function timeFitFactor(place: Place, travelMinutes: number | null, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 15;
  if (ctx.availableMinutes === null) return { key: 'time', label: 'זמן פנוי', points: maxPoints, maxPoints };
  if (ctx.availableMinutes === 0) return { key: 'time', label: 'זמן פנוי', points: 0, maxPoints };

  const needed = (travelMinutes ?? 0) + place.estimatedDurationMinutes;
  const margin = clamp((ctx.availableMinutes - needed) / ctx.availableMinutes, 0, 1);
  return { key: 'time', label: 'זמן פנוי', points: maxPoints * (0.5 + 0.5 * margin), maxPoints };
}

function energyFitFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 10;
  const gap = Math.abs(place.energyRequired - ctx.energyLevel);
  const points = maxPoints * clamp(1 - gap / 4, 0, 1);
  return { key: 'energy', label: 'רמת אנרגיה', points, maxPoints };
}

function budgetFitFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 10;
  if (!place.priceLevel) return { key: 'budget', label: 'תקציב', points: maxPoints * 0.7, maxPoints };
  const points = place.priceLevel <= ctx.budget ? maxPoints : maxPoints * 0.3;
  return { key: 'budget', label: 'תקציב', points, maxPoints };
}

function groupFitFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 10;
  const groupTag = ctx.groupSize <= 1 ? 'solo' : ctx.groupSize <= 2 ? 'couple' : 'friends';
  const fits = place.groupSuitability.includes('any') || place.groupSuitability.includes(groupTag);
  return { key: 'group', label: 'התאמה לקבוצה', points: fits ? maxPoints : maxPoints * 0.4, maxPoints };
}

/**
 * Most places don't carry an explicit `indoorOutdoor` fact (verified only
 * where a real, checkable property of the venue makes it obvious — see
 * places.seed.ts's Phase 6 comments). For everything else, category is a
 * reasonable default: a bar/café/restaurant/club/casino is indoor, a
 * sightseeing attraction is outdoor by default. This is only ever a
 * fallback — a real per-place fact always wins.
 */
export function inferIndoorOutdoor(place: Place): NonNullable<Place['indoorOutdoor']> {
  if (place.indoorOutdoor) return place.indoorOutdoor;
  switch (place.category) {
    case 'food':
    case 'cafe':
    case 'bar':
    case 'club':
    case 'casino':
    case 'medical':
    case 'adrenaline':
    case 'water':
    case 'shopping':
      return 'indoor';
    case 'attraction':
      return 'outdoor';
    default:
      return 'both';
  }
}

/**
 * "Critical" per the brief: a real weather signal, weighted close to
 * distance/time (15, not the old 10) so it can genuinely move the ranking —
 * while never fully zeroing out an option (a strong penalty, not
 * elimination — see the brief's "do not completely eliminate unless there's
 * a genuine safety/availability reason").
 *
 * When weather is unavailable, this factor contributes literally nothing —
 * 0 points out of 0 maxPoints — rather than guessing a neutral value, so a
 * weather outage can never bias the ranking one way or another.
 */
function weatherFitFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 15;
  const weather = ctx.weather;
  if (!weather) return { key: 'weather', label: 'מזג אוויר', points: 0, maxPoints: 0 };

  const io = inferIndoorOutdoor(place);
  if (io === 'both') return { key: 'weather', label: 'מזג אוויר', points: maxPoints * 0.8, maxPoints };

  if (weather.isRaining) {
    const points = io === 'indoor' ? maxPoints : maxPoints * 0.15;
    return { key: 'weather', label: 'מזג אוויר', points, maxPoints };
  }
  if (weather.isComfortableOutside) {
    const points = io === 'outdoor' ? maxPoints : maxPoints * 0.75;
    return { key: 'weather', label: 'מזג אוויר', points, maxPoints };
  }
  // Not raining, but not comfortable either (too hot/cold, or snow/storm
  // without active rain) — a mild nudge toward indoor, never a hard penalty.
  const points = io === 'indoor' ? maxPoints * 0.85 : maxPoints * 0.5;
  return { key: 'weather', label: 'מזג אוויר', points, maxPoints };
}

function freshnessFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 5;
  const visited = ctx.visitedPlaces.includes(place.id);
  return { key: 'freshness', label: 'לא ביקרנו עדיין', points: visited ? 0 : maxPoints, maxPoints };
}

function bookingFactor(place: Place): ScoreFactor {
  const maxPoints = 5;
  return { key: 'booking', label: 'לא דורש הזמנה מראש', points: place.requiresBooking ? 0 : maxPoints, maxPoints };
}

/** "לא בא לנו" softly, temporarily penalizes — it's a mood signal from a few minutes ago, not a permanent verdict on the place. */
function dismissalFactor(place: Place, ctx: RecommendationContext): ScoreFactor {
  const maxPoints = 8;
  const dismissedRecently = ctx.recentDismissals.includes(place.id);
  return { key: 'dismissal', label: 'לא נדחה לאחרונה', points: dismissedRecently ? 0 : maxPoints, maxPoints };
}

/**
 * A Google rating is metadata, not a verdict — this factor's `maxPoints` is
 * deliberately small relative to the others (mood alone is 20) so a great
 * rating can nudge the order but never outweigh actual fit (distance, time,
 * hunger). No rating on file scores the same neutral default as an unrated
 * priceLevel/weather does elsewhere in this file.
 */
function ratingFactor(place: Place): ScoreFactor {
  const maxPoints = 5;
  if (place.rating === undefined) return { key: 'rating', label: 'דירוג גוגל', points: maxPoints * 0.7, maxPoints };
  const points = maxPoints * clamp((place.rating - 3.5) / 1.5, 0, 1);
  return { key: 'rating', label: 'דירוג גוגל', points, maxPoints };
}

export function scorePlace(place: Place, ctx: RecommendationContext): ScoredPlace {
  const { distanceKm, travelMinutes } = travelInfoFor(place, ctx);

  const factors: ScoreFactor[] = [
    moodMatchFactor(place, ctx),
    needFitFactor(place, ctx),
    distanceFitFactor(travelMinutes),
    timeFitFactor(place, travelMinutes, ctx),
    energyFitFactor(place, ctx),
    budgetFitFactor(place, ctx),
    groupFitFactor(place, ctx),
    weatherFitFactor(place, ctx),
    freshnessFactor(place, ctx),
    bookingFactor(place),
    dismissalFactor(place, ctx),
    ratingFactor(place),
  ];

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  const maxScore = factors.reduce((sum, f) => sum + f.maxPoints, 0);

  const fitsInAvailableTime =
    ctx.availableMinutes === null ||
    (travelMinutes ?? 0) + place.estimatedDurationMinutes <= ctx.availableMinutes;

  return { place, score, maxScore, factors, distanceKm, travelMinutes, fitsInAvailableTime };
}
