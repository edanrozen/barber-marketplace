import type { EnergyLevel, MoodTag, Place, RecommendationContext, ScheduleItem, TripDay, UserState } from '@/types';
import { getCurrentTime, minutesToHHMM, nowMinutes, parseHHMM } from '@/lib/time';
import { findCurrentFixedItem, findNextFixedItem, referenceMinutesFor, SAFETY_BUFFER_MINUTES } from '@/lib/tripSchedule';
import { getTravelTime } from '@/lib/distance';

export interface BuildContextInput {
  places: Place[];
  currentDay: TripDay | null;
  /** The trip day immediately before `currentDay`, if known — used only to notice an overnight energy carryover (a long night ending well past midnight still tiring the next morning). */
  previousDay?: TripDay | null;
  userState: UserState;
  mood: MoodTag | 'surprise_me' | null;
  excludeIds?: string[];
  /** Place ids "לא בא לנו"-dismissed recently — softly penalized this pass, never permanently. */
  recentDismissals?: string[];
  /** Override "now" for testing; defaults to the live Budapest clock. */
  now?: Date;
}

const SAME_DAY_FATIGUE_LOOKBACK_MINUTES = 240;
const MORNING_FATIGUE_CUTOFF_MINUTES = 12 * 60;
const HIGH_ENERGY_THRESHOLD: EnergyLevel = 4;
const FATIGUE_PENALTY = 1;

function itemEffectiveEnd(item: ScheduleItem, place: Place): number {
  return item.endTime ? parseHHMM(item.endTime) : parseHHMM(item.startTime) + place.estimatedDurationMinutes;
}

/** A high-energy item that finished recently enough to still be felt. */
function hasRecentHighEnergyEnd(places: Place[], day: TripDay, referenceMinutes: number): boolean {
  return day.scheduleItems.some((item) => {
    if (item.status === 'cancelled') return false;
    const place = item.placeId ? places.find((p) => p.id === item.placeId) : undefined;
    if (!place || place.energyRequired < HIGH_ENERGY_THRESHOLD) return false;
    const end = itemEffectiveEnd(item, place);
    return end <= referenceMinutes && referenceMinutes - end <= SAME_DAY_FATIGUE_LOOKBACK_MINUTES;
  });
}

/** A late/long night (started late, or ran past midnight) that's still worth favoring a mellow morning after. */
function hadOvernightHighEnergy(places: Place[], day: TripDay): boolean {
  return day.scheduleItems.some((item) => {
    if (item.status === 'cancelled') return false;
    const place = item.placeId ? places.find((p) => p.id === item.placeId) : undefined;
    if (!place || place.energyRequired < HIGH_ENERGY_THRESHOLD) return false;
    const start = parseHHMM(item.startTime);
    const end = itemEffectiveEnd(item, place);
    return start >= 22 * 60 || end >= 1440;
  });
}

/**
 * The user's own energyLevel slider is a preference, not a live fact — a
 * recent hard-charging activity (Aquaworld ending 15:00, a club night
 * ending 02:00) really does make high-energy options less appealing for a
 * while afterward, and a mellow one more appealing. Only ever nudges by
 * one level, and never below 1.
 */
function deriveEffectiveEnergy(
  places: Place[],
  liveDay: TripDay | null,
  previousDay: TripDay | null | undefined,
  currentMinutes: number,
  baseEnergyLevel: EnergyLevel,
): EnergyLevel {
  if (!liveDay) return baseEnergyLevel;

  const fatigued =
    hasRecentHighEnergyEnd(places, liveDay, currentMinutes) ||
    (currentMinutes < MORNING_FATIGUE_CUTOFF_MINUTES && !!previousDay && hadOvernightHighEnergy(places, previousDay));

  return fatigued ? (Math.max(1, baseEnergyLevel - FATIGUE_PENALTY) as EnergyLevel) : baseEnergyLevel;
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

  // Being IN the middle of a locked commitment (Bubble Football 13:30–15:30)
  // is different from just having one coming up — it means "not available
  // for anything else right now" even if the next fixed item is hours away.
  const currentActivity = liveDay ? findCurrentFixedItem(liveDay, currentMinutes, input.places) : null;

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

  const availableMinutes = currentActivity
    ? 0
    : latestFinishTimeMinutes === null
      ? null
      : Math.max(latestFinishTimeMinutes - currentMinutes, 0);

  const effectiveEnergyLevel = deriveEffectiveEnergy(
    input.places,
    liveDay,
    input.previousDay,
    currentMinutes,
    input.userState.energyLevel,
  );

  return {
    currentTime: now,
    currentLocation: input.userState.currentLocation,
    currentDay: input.currentDay,
    currentActivity,
    availableMinutes,
    latestFinishTimeMinutes,
    nextFixedActivity,
    nextFixedActivityStart: nextFixedActivity?.startTime ?? null,
    travelTimeToNextActivity,
    hungerLevel: input.userState.hungerLevel,
    thirstLevel: input.userState.thirstLevel,
    energyLevel: effectiveEnergyLevel,
    mood: input.mood,
    budget: input.userState.budget,
    groupSize: input.userState.groupSize,
    weather: input.userState.weather,
    visitedPlaces: input.places.filter((p) => p.visited).map((p) => p.id),
    excludeIds: input.excludeIds ?? [],
    recentDismissals: input.recentDismissals ?? [],
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
