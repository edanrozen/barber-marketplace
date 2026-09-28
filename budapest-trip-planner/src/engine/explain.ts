import type { ScoredPlace } from '@/types';
import { formatDuration } from '@/lib/time';
import type { EngineContext } from './types';

/**
 * Turns a score into one human sentence. The user never sees the numbers —
 * just why this place, right now. Picks the two or three most relevant
 * facts rather than reciting every factor.
 */
export function buildExplanation(scored: ScoredPlace, ctx: EngineContext): string {
  const parts: string[] = [];

  if (scored.travelMinutes !== null) {
    parts.push(`אתם ${scored.travelMinutes} דקות הליכה משם`);
  }

  if (ctx.timeAvailableMinutes !== null) {
    const activityLabel = ctx.nextActivityTitle ? ` לפני "${ctx.nextActivityTitle}"` : ' לפני התוכנית הבאה';
    parts.push(`יש לכם ${formatDuration(ctx.timeAvailableMinutes)} פנויות${activityLabel}`);
  }

  const topFactor = [...scored.factors]
    .filter((f) => f.key === 'mood' || f.key === 'need')
    .sort((a, b) => b.points / b.maxPoints - a.points / a.maxPoints)[0];

  if (topFactor && topFactor.points / topFactor.maxPoints >= 0.8) {
    parts.push('והמקום מתאים בדיוק למצב שלכם כרגע');
  } else {
    parts.push('והוא היה הכי הגיוני מכל האפשרויות שבדקתי');
  }

  return `${parts.join(', ')}.`;
}
