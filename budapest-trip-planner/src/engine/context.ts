import type { MoodTag, Place, RecommendationContext, ScheduleItem, TripDay, UserState } from '@/types';
import { getCurrentTime, minutesToHHMM, nowMinutes, parseHHMM } from '@/lib/time';
import { findNextFixedItem, referenceMinutesFor, SAFETY_BUFFER_MINUTES } from '@/lib/tripSchedule';
import { getTravelTime } from '@/lib/distance';

export interface BuildContextInput {
  places: Place[];
  currentDay: TripDay | null;
  userState: UserState;
  mood: MoodTag | 'surprise_me' | null;
  excludeIds?: string[];
  /** Override "now" for testing; defaults to the live Budapest clock. */
  now?: Date;
}

/**
 * Assembles the one object the recommendation engine actually reads:
 * where we are, what's coming up on the schedule, how much runway that
 * leaves, and the live hunger/thirst/energy/mood/budget snapshot. This is
 * the ONLY place `RecommendationContext` gets built — UI code just calls
 * this and hands the result to `getRecommendation`.
 */
export function buildRecommendationContext(input: BuildContextInput): RecommendationContext {
  const now = input.now ?? getCurrentTime();
  const rawReference = input.currentDay ? referenceMinutesFor(input.currentDay, now) : nowMinutes(now);
  // A day that's days away (before or after "today") has no live countdown
  // — +/-Infinity from referenceMinutesFor signals exactly that. Treat it
  // the same as having no current day for schedule-derived fields, rather
  // than letting Infinity leak into availableMinutes/timeUntilStart.
  const liveDay = Number.isFinite(rawReference) ? input.currentDay : null;
  const currentMinutes = Number.isFinite(rawReference) ? rawReference : nowMinutes(now);

  const nextFixedActivity = liveDay ? findNextFixedItem(liveDay, currentMinutes) : null;
  const nextFixedPlace = nextFixedActivity?.placeId
    ? (input.places.find((p) => p.id === nextFixedActivity.placeId) ?? null)
    : null;

  const travelTimeToNextActivity =
    nextFixedActivity && input.userState.currentLocation && nextFixedPlace?.coordinates
      ? getTravelTime(input.userState.currentLocation, nextFixedPlace.coordinates).minutes
      : null;

  const latestFinishTimeMinutes = nextFixedActivity
    ? parseHHMM(nextFixedActivity.startTime) - (travelTimeToNextActivity ?? 0) - SAFETY_BUFFER_MINUTES
    : null;

  const availableMinutes =
    latestFinishTimeMinutes === null ? null : Math.max(latestFinishTimeMinutes - currentMinutes, 0);

  return {
    currentTime: now,
    currentLocation: input.userState.currentLocation,
    currentDay: input.currentDay,
    availableMinutes,
    latestFinishTimeMinutes,
    nextFixedActivity,
    nextFixedActivityStart: nextFixedActivity?.startTime ?? null,
    travelTimeToNextActivity,
    hungerLevel: input.userState.hungerLevel,
    thirstLevel: input.userState.thirstLevel,
    energyLevel: input.userState.energyLevel,
    mood: input.mood,
    budget: input.userState.budget,
    groupSize: input.userState.groupSize,
    weather: input.userState.weather,
    visitedPlaces: input.places.filter((p) => p.visited).map((p) => p.id),
    excludeIds: input.excludeIds ?? [],
  };
}

export interface NextFixedActivityInfo {
  activity: ScheduleItem;
  startTime: string;
  location: string | null;
  timeUntilStartMinutes: number;
  estimatedTravelMinutes: number | null;
  /** "HH:mm" — the latest moment to head out and still make it on time. */
  latestSafeDepartureTime: string;
}

/** Everything the "next fixed activity" UI card needs, in one call. */
export function getNextFixedActivity(
  day: TripDay | null,
  places: Place[],
  userState: UserState,
  now: Date,
): NextFixedActivityInfo | null {
  if (!day) return null;
  const rawReference = referenceMinutesFor(day, now);
  if (!Number.isFinite(rawReference)) return null; // day is days away — no live "next activity" to show
  const currentMinutes = rawReference;
  const activity = findNextFixedItem(day, currentMinutes);
  if (!activity) return null;

  const place = activity.placeId ? (places.find((p) => p.id === activity.placeId) ?? null) : null;
  const startMinutes = parseHHMM(activity.startTime);
  const estimatedTravelMinutes =
    userState.currentLocation && place?.coordinates
      ? getTravelTime(userState.currentLocation, place.coordinates).minutes
      : null;
  const latestSafeDepartureMinutes = startMinutes - (estimatedTravelMinutes ?? 0) - SAFETY_BUFFER_MINUTES;

  return {
    activity,
    startTime: activity.startTime,
    location: place?.location ?? place?.name ?? null,
    timeUntilStartMinutes: Math.max(startMinutes - currentMinutes, 0),
    estimatedTravelMinutes,
    latestSafeDepartureTime: minutesToHHMM(latestSafeDepartureMinutes),
  };
}
