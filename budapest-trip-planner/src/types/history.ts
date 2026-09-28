import type { MoodTag } from './place';

export type RecommendationResultKind = 'recommended' | 'selected' | 'dismissed' | 'done';

/** One entry in the recent-recommendations log — used to avoid repeating ourselves, never grows without bound. */
export interface RecommendationHistoryItem {
  placeId: string;
  timestamp: string;
  mood: MoodTag | 'surprise_me' | null;
  result: RecommendationResultKind;
}

/**
 * "לא בא לנו" for a specific place, in a specific mood context. Temporary
 * by design — it softly penalizes that place for a little while, it never
 * permanently blocks it (that's what the NOT_RELEVANT place status is
 * for, a completely separate, deliberate action).
 */
export interface RecommendationDismissal {
  placeId: string;
  timestamp: string;
  mood: MoodTag | 'surprise_me' | null;
}
