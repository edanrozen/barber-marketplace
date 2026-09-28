import type { GeoCoordinates, MoodTag, Place, PriceLevel } from './place';
import type { ScheduleItem, TripDay } from './trip';
import type { EnergyLevel, Level0to3, WeatherSnapshot } from './userState';

/** One named factor that contributed to a place's score, kept for debugging/explanation — never shown raw to the user. */
export interface ScoreFactor {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
}

export interface ScoredPlace {
  place: Place;
  score: number;
  maxScore: number;
  factors: ScoreFactor[];
  distanceKm: number | null;
  travelMinutes: number | null;
  fitsInAvailableTime: boolean;
}

/**
 * Full situational context the recommendation engine reads on every call —
 * "what's true right now", assembled from the trip schedule, the places
 * store and the live user state by `engine/context.ts::buildRecommendationContext`.
 * UI code never constructs this by hand.
 */
export interface RecommendationContext {
  currentTime: Date;
  currentLocation: GeoCoordinates | null;
  currentDay: TripDay | null;

  /** Minutes free right now before the next fixed commitment, already buffer-trimmed. null = nothing fixed left today (unconstrained). */
  availableMinutes: number | null;
  /** Absolute minutes-since-midnight by which any spontaneous activity must be finished. null = unconstrained. */
  latestFinishTimeMinutes: number | null;
  nextFixedActivity: ScheduleItem | null;
  /** "HH:mm" convenience mirror of `nextFixedActivity.startTime`. */
  nextFixedActivityStart: string | null;
  /** Estimated one-way travel minutes from currentLocation to the next fixed activity's place, when both are known. */
  travelTimeToNextActivity: number | null;

  hungerLevel: Level0to3;
  thirstLevel: Level0to3;
  energyLevel: EnergyLevel;
  mood: MoodTag | 'surprise_me' | null;
  budget: PriceLevel;
  groupSize: number;
  weather: WeatherSnapshot | null;
  visitedPlaces: string[];

  /** Place ids to skip this pass — backs "give me another option". */
  excludeIds: string[];
}

export interface RecommendationResult {
  best: ScoredPlace | null;
  alternatives: ScoredPlace[];
  explanation: string | null;
  /** True when there's no time left before the next fixed commitment — the UI must tell the user to head out, never offer a new activity. */
  mustLeaveNow: boolean;
  context: RecommendationContext;
}
