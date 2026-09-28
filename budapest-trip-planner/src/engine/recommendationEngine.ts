import type { Place, RecommendationContext, RecommendationResult } from '@/types';
import { filterCandidates } from './filters';
import { scorePlace } from './scoring';
import { buildExplanation } from './explain';

const MAX_ALTERNATIVES = 3;

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
export function getRecommendation(places: Place[], ctx: RecommendationContext): RecommendationResult {
  const mustLeaveNow = ctx.availableMinutes !== null && ctx.availableMinutes <= 0;

  if (mustLeaveNow) {
    return { best: null, alternatives: [], explanation: null, mustLeaveNow: true, context: ctx };
  }

  const candidates = filterCandidates(places, ctx);
  const scored = candidates.map((place) => scorePlace(place, ctx)).sort((a, b) => b.score - a.score);

  const best = scored[0] ?? null;
  const alternatives = scored.slice(1, 1 + MAX_ALTERNATIVES);

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
export { MOOD_OPTIONS, moodOption } from './moods';
export { detectScheduleConflicts, computeFreeTimeBlocks } from '@/lib/tripSchedule';
export type { FreeTimeBlock, ScheduleConflict } from '@/lib/tripSchedule';
