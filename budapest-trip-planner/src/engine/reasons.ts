import type { RecommendationContext, ScoredPlace } from '@/types';
import { isOpenAt } from '@/lib/time';

const STRONG_RATIO = 0.8;

function factorRatio(scored: ScoredPlace, key: string): number {
  const factor = scored.factors.find((f) => f.key === key);
  return factor && factor.maxPoints > 0 ? factor.points / factor.maxPoints : 0;
}

/**
 * "למה דווקא זה?" — 3 to 5 short, true reasons, built only from things we
 * can actually verify (the same score factors that decided the pick, plus
 * a couple of direct facts). Never invents a reason: a place with unknown
 * opening hours never gets an "open now" bullet, a place we can't judge
 * the price of never gets a "in budget" bullet.
 */
export function buildReasons(scored: ScoredPlace, ctx: RecommendationContext): string[] {
  const { place } = scored;
  const reasons: string[] = [];

  if (scored.travelMinutes !== null && scored.travelMinutes <= 12) {
    reasons.push('✓ קרוב אליכם');
  }

  if (factorRatio(scored, 'mood') >= STRONG_RATIO) {
    reasons.push('✓ מתאים במיוחד למצב הרוח שלכם');
  }

  if (factorRatio(scored, 'need') >= STRONG_RATIO) {
    if (place.category === 'food' || place.category === 'cafe') reasons.push('✓ מתאים לרמת הרעב');
    else if (place.category === 'bar' || place.category === 'club') reasons.push('✓ מתאים לרמת הצמא');
  }

  if (ctx.availableMinutes !== null && scored.fitsInAvailableTime) {
    reasons.push('✓ מתאים לזמן הפנוי שיש לכם');
  }

  if (factorRatio(scored, 'energy') >= STRONG_RATIO) {
    reasons.push('✓ מתאים לרמת האנרגיה כרגע');
  }

  const hasHours = Object.keys(place.openingHours).length > 0;
  if (hasHours && isOpenAt(place.openingHours, ctx.currentTime)) {
    reasons.push('✓ פתוח עכשיו');
  }

  if (place.priceLevel && place.priceLevel <= ctx.budget) {
    reasons.push('✓ בתקציב שלכם');
  }

  if (!place.visited) {
    reasons.push('✓ עוד לא ביקרתם');
  }

  if (!place.requiresBooking) {
    reasons.push('✓ לא דורש הזמנה מראש');
  }

  return reasons.slice(0, 5);
}

/** The one honest line about hours, for when we simply don't know — never claims open OR closed without data. */
export function openingHoursCaveat(scored: ScoredPlace): string | null {
  const hasHours = Object.keys(scored.place.openingHours).length > 0;
  return hasHours ? null : 'צריך לבדוק שעות פעילות.';
}
