import type { Place } from './place';

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

export interface RecommendationContext {
  nowMinutes: number;
  timeAvailableMinutes: number | null;
  nextActivityTitle: string | null;
}

export interface RecommendationResult {
  best: ScoredPlace | null;
  alternatives: ScoredPlace[];
  explanation: string | null;
  context: RecommendationContext;
}
