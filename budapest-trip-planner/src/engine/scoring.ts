import type { Place, ScoreFactor, ScoredPlace } from '@/types';
import { travelInfoFor } from './filters';
import { TIME_BUFFER_MINUTES, type EngineContext } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function moodMatchFactor(place: Place, ctx: EngineContext): ScoreFactor {
  const maxPoints = 20;
  if (!ctx.mood || ctx.mood === 'surprise_me') {
    return { key: 'mood', label: 'התאמה למצב', points: maxPoints * 0.6, maxPoints };
  }
  const points = place.moodTags.includes(ctx.mood) ? maxPoints : maxPoints * 0.5;
  return { key: 'mood', label: 'התאמה למצב', points, maxPoints };
}

function needFitFactor(place: Place, ctx: EngineContext): ScoreFactor {
  const maxPoints = 10;
  const { hungerLevel, thirstLevel } = ctx.userState;
  let points = maxPoints * 0.5;

  if (place.category === 'food' || place.category === 'cafe') {
    points = maxPoints * (hungerLevel / 3);
  } else if (place.category === 'bar' || place.category === 'club') {
    points = maxPoints * (thirstLevel / 3);
  }
  return { key: 'need', label: 'התאמה לרעב/צמא', points, maxPoints };
}

function distanceFitFactor(travelMinutes: number | null): ScoreFactor {
  const maxPoints = 15;
  if (travelMinutes === null) return { key: 'distance', label: 'מרחק', points: maxPoints * 0.5, maxPoints };
  const points = maxPoints * clamp(1 - travelMinutes / 30, 0, 1);
  return { key: 'distance', label: 'מרחק', points, maxPoints };
}

function timeFitFactor(place: Place, travelMinutes: number | null, ctx: EngineContext): ScoreFactor {
  const maxPoints = 15;
  if (ctx.timeAvailableMinutes === null) return { key: 'time', label: 'זמן פנוי', points: maxPoints, maxPoints };

  const travel = travelMinutes ?? 0;
  const needed = travel * 2 + place.estimatedDurationMinutes + TIME_BUFFER_MINUTES;
  if (needed <= ctx.timeAvailableMinutes) return { key: 'time', label: 'זמן פנוי', points: maxPoints, maxPoints };

  const ratio = ctx.timeAvailableMinutes / needed;
  return { key: 'time', label: 'זמן פנוי', points: maxPoints * clamp(ratio, 0, 1), maxPoints };
}

function energyFitFactor(place: Place, ctx: EngineContext): ScoreFactor {
  const maxPoints = 10;
  const gap = Math.abs(place.energyRequired - ctx.userState.energyLevel);
  const points = maxPoints * clamp(1 - gap / 4, 0, 1);
  return { key: 'energy', label: 'רמת אנרגיה', points, maxPoints };
}

function budgetFitFactor(place: Place, ctx: EngineContext): ScoreFactor {
  const maxPoints = 10;
  if (!place.priceLevel) return { key: 'budget', label: 'תקציב', points: maxPoints * 0.7, maxPoints };
  const points = place.priceLevel <= ctx.userState.budget ? maxPoints : maxPoints * 0.3;
  return { key: 'budget', label: 'תקציב', points, maxPoints };
}

function groupFitFactor(place: Place, ctx: EngineContext): ScoreFactor {
  const maxPoints = 10;
  const groupTag = ctx.userState.groupSize <= 1 ? 'solo' : ctx.userState.groupSize <= 2 ? 'couple' : 'friends';
  const fits = place.groupSuitability.includes('any') || place.groupSuitability.includes(groupTag);
  return { key: 'group', label: 'התאמה לקבוצה', points: fits ? maxPoints : maxPoints * 0.4, maxPoints };
}

function weatherFitFactor(place: Place, ctx: EngineContext): ScoreFactor {
  const maxPoints = 10;
  const weather = ctx.userState.weather;
  if (!weather || place.indoorOutdoor === 'both') {
    return { key: 'weather', label: 'מזג אוויר', points: maxPoints * 0.8, maxPoints };
  }
  const badOutside = weather.condition === 'rain' || weather.condition === 'storm' || weather.condition === 'snow' || weather.tempC < 5;
  const points = badOutside
    ? place.indoorOutdoor === 'indoor' ? maxPoints : maxPoints * 0.2
    : place.indoorOutdoor === 'outdoor' ? maxPoints : maxPoints * 0.7;
  return { key: 'weather', label: 'מזג אוויר', points, maxPoints };
}

function freshnessFactor(place: Place): ScoreFactor {
  const maxPoints = 5;
  return { key: 'freshness', label: 'לא ביקרנו עדיין', points: place.visited ? 0 : maxPoints, maxPoints };
}

function bookingFactor(place: Place): ScoreFactor {
  const maxPoints = 5;
  return { key: 'booking', label: 'לא דורש הזמנה מראש', points: place.requiresBooking ? 0 : maxPoints, maxPoints };
}

export function scorePlace(place: Place, ctx: EngineContext): ScoredPlace {
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
    freshnessFactor(place),
    bookingFactor(place),
  ];

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  const maxScore = factors.reduce((sum, f) => sum + f.maxPoints, 0);

  const fitsInAvailableTime =
    ctx.timeAvailableMinutes === null ||
    (travelMinutes ?? 0) + place.estimatedDurationMinutes + TIME_BUFFER_MINUTES <= ctx.timeAvailableMinutes;

  return { place, score, maxScore, factors, distanceKm, travelMinutes, fitsInAvailableTime };
}
