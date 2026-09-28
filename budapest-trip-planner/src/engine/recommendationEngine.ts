import type { Place, PlaceCategory, RecommendationContext, RecommendationResult, ScoredPlace } from '@/types';
import { filterCandidates } from './filters';
import { scorePlace } from './scoring';
import { buildExplanation } from './explain';

const MAX_ALTERNATIVES = 3;
/** A different-category pick must still score at least this fraction of the top pick to count as a "strong nearby alternative" — diversity should never force a genuinely worse choice. */
const DIVERSITY_SCORE_TOLERANCE = 0.85;

export interface GetRecommendationOptions {
  /** Categories already shown earlier in this same mood session ("תן אופציה אחרת") — prefer a different one when a strong candidate exists, rather than repeating the same category (or the literal same place, which excludeIds already handles). */
  avoidCategories?: PlaceCategory[];
}

/**
 * If the top pick's category is one we're trying to avoid repeating, and a
 * strong-enough (within DIVERSITY_SCORE_TOLERANCE) candidate in a
 * different category exists further down the ranking, promote it to the
 * front instead. Never reaches for a weak pick just for variety's sake.
 */
function reorderForDiversity(scored: ScoredPlace[], avoidCategories: PlaceCategory[]): ScoredPlace[] {
  const top = scored[0];
  if (!top || avoidCategories.length === 0 || !avoidCategories.includes(top.place.category)) return scored;

  const threshold = top.score * DIVERSITY_SCORE_TOLERANCE;
  const diverseIndex = scored.findIndex(
    (s, i) => i > 0 && !avoidCategories.includes(s.place.category) && s.score >= threshold,
  );
  if (diverseIndex === -1) return scored;

  const reordered = [...scored];
  const [diverse] = reordered.splice(diverseIndex, 1);
  reordered.unshift(diverse as ScoredPlace);
  return reordered;
}

/**
 * The whole point of the app: given everything we know right now (built by
 * `buildRecommendationContext`), pick ONE place and say why — not a ranked
 * list of twenty. `alternatives` exists only to back "give me another
 * option" without re-running the engine.
 *
 * When there's no time left before the next fixed commitment
 * (`ctx.availableMinutes === 0`), this never returns a pick: `mustLeaveNow`
 * is true and `best` is null — the UI must tell the user to head out, not
 * offer something new.
 */
export function getRecommendation(
  places: Place[],
  ctx: RecommendationContext,
  options?: GetRecommendationOptions,
): RecommendationResult {
  const mustLeaveNow = ctx.availableMinutes !== null && ctx.availableMinutes <= 0;

  if (mustLeaveNow) {
    return { best: null, alternatives: [], explanation: null, mustLeaveNow: true, context: ctx };
  }

  const candidates = filterCandidates(places, ctx);
  const scored = candidates.map((place) => scorePlace(place, ctx)).sort((a, b) => b.score - a.score);
  const ordered = options?.avoidCategories?.length ? reorderForDiversity(scored, options.avoidCategories) : scored;

  const best = ordered[0] ?? null;
  const alternatives = ordered.slice(1, 1 + MAX_ALTERNATIVES);

  return {
    best,
    alternatives,
    explanation: best ? buildExplanation(best, ctx) : null,
    mustLeaveNow: false,
    context: ctx,
  };
}

export { buildRecommendationContext, getNextFixedActivity } from './context';
export type { BuildContextInput, NextFixedActivityInfo } from './context';
export { getCurrentTripState } from './tripState';
export type { CurrentTripState } from './tripState';
export { buildReasons, openingHoursCaveat } from './reasons';
export { MOOD_OPTIONS, moodOption } from './moods';
export { detectScheduleConflicts, computeFreeTimeBlocks } from '@/lib/tripSchedule';
export type { FreeTimeBlock, ScheduleConflict } from '@/lib/tripSchedule';
