import type { EnergyLevel, GeoCoordinates, Level0to3, MoodTag, ScheduleItem, TripDay } from '@/types';
import { buildRecommendationContext, type BuildContextInput } from './context';

/**
 * The single source of truth the Home screen reads BEFORE the user has
 * even picked a mood: where/when we are, what's on the schedule, how much
 * runway there is. Literally `buildRecommendationContext` with `mood`
 * fixed to null and trimmed to the fields that make sense outside a
 * specific recommendation request.
 */
export interface CurrentTripState {
  currentDay: TripDay | null;
  currentTime: Date;
  currentLocation: GeoCoordinates | null;
  currentActivity: ScheduleItem | null;
  nextFixedActivity: ScheduleItem | null;
  availableMinutes: number | null;
  hungerLevel: Level0to3;
  thirstLevel: Level0to3;
  energyLevel: EnergyLevel;
  mood: MoodTag | 'surprise_me' | null;
  visitedPlaces: string[];
}

export function getCurrentTripState(input: Omit<BuildContextInput, 'mood'>): CurrentTripState {
  const ctx = buildRecommendationContext({ ...input, mood: null });
  return {
    currentDay: ctx.currentDay,
    currentTime: ctx.currentTime,
    currentLocation: ctx.currentLocation,
    currentActivity: ctx.currentActivity,
    nextFixedActivity: ctx.nextFixedActivity,
    availableMinutes: ctx.availableMinutes,
    hungerLevel: ctx.hungerLevel,
    thirstLevel: ctx.thirstLevel,
    energyLevel: ctx.energyLevel,
    mood: ctx.mood,
    visitedPlaces: ctx.visitedPlaces,
  };
}
