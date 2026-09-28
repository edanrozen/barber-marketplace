import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MoodTag, RecommendationDismissal, RecommendationHistoryItem, RecommendationResultKind } from '@/types';

const MAX_HISTORY_ITEMS = 50;
const MAX_DISMISSALS = 30;
/** How long a "לא בא לנו" keeps softly penalizing a place — long enough to survive switching moods and coming back, short enough that it's genuinely temporary. */
export const DISMISSAL_WINDOW_MINUTES = 60;

interface RecommendationHistoryState {
  history: RecommendationHistoryItem[];
  dismissals: RecommendationDismissal[];
  logResult: (placeId: string, mood: MoodTag | 'surprise_me' | null, result: RecommendationResultKind) => void;
  dismiss: (placeId: string, mood: MoodTag | 'surprise_me' | null) => void;
  /** Place ids dismissed within the last DISMISSAL_WINDOW_MINUTES, relative to `now`. */
  recentDismissals: (now: Date) => string[];
}

export const useRecommendationHistoryStore = create<RecommendationHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      dismissals: [],

      logResult: (placeId, mood, result) => {
        const entry: RecommendationHistoryItem = { placeId, mood, result, timestamp: new Date().toISOString() };
        set({ history: [...get().history, entry].slice(-MAX_HISTORY_ITEMS) });
      },

      dismiss: (placeId, mood) => {
        const entry: RecommendationDismissal = { placeId, mood, timestamp: new Date().toISOString() };
        set({ dismissals: [...get().dismissals, entry].slice(-MAX_DISMISSALS) });
        get().logResult(placeId, mood, 'dismissed');
      },

      recentDismissals: (now) => {
        const cutoff = now.getTime() - DISMISSAL_WINDOW_MINUTES * 60_000;
        return get()
          .dismissals.filter((d) => new Date(d.timestamp).getTime() >= cutoff)
          .map((d) => d.placeId);
      },
    }),
    { name: 'budapest-trip-planner:recommendation-history' },
  ),
);
