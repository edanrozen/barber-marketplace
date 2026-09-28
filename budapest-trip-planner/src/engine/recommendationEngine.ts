import type { Place, RecommendationResult } from '@/types';
import { filterCandidates } from './filters';
import { scorePlace } from './scoring';
import { buildExplanation } from './explain';
import type { EngineContext } from './types';

const MAX_ALTERNATIVES = 3;

/**
 * The whole point of the app: given everything we know right now, pick ONE
 * place and say why — not a ranked list of twenty. `alternatives` exists
 * only to back "give me another option" without re-running the engine.
 */
export function getRecommendation(places: Place[], ctx: EngineContext): RecommendationResult {
  const candidates = filterCandidates(places, ctx);
  const scored = candidates.map((place) => scorePlace(place, ctx)).sort((a, b) => b.score - a.score);

  const best = scored[0] ?? null;
  const alternatives = scored.slice(1, 1 + MAX_ALTERNATIVES);

  return {
    best,
    alternatives,
    explanation: best ? buildExplanation(best, ctx) : null,
    context: {
      nowMinutes: ctx.now.getHours() * 60 + ctx.now.getMinutes(),
      timeAvailableMinutes: ctx.timeAvailableMinutes,
      nextActivityTitle: ctx.nextActivityTitle,
    },
  };
}

export type { EngineContext } from './types';
export { MOOD_OPTIONS, moodOption } from './moods';
