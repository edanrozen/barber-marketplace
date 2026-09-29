import type { RecommendationWeather, WeatherConditionBucket } from '@/types';

export interface WeatherVisual {
  /** Tailwind gradient classes for a card/hero background. */
  gradient: string;
  /** Subtle motion class applied to a decorative layer, or none. */
  motionClass: string | null;
}

/**
 * Maps a real weather condition to a subtle visual treatment — never a
 * generic weather-widget look. Effects are deliberately restrained (a soft
 * glow, a drifting cloud layer, a light rain-line overlay) per the brief's
 * "keep effects subtle and performant" rule.
 */
export function weatherVisual(condition: WeatherConditionBucket): WeatherVisual {
  switch (condition) {
    case 'clear':
      return { gradient: 'from-accent-gold/25 via-accent-violet/15 to-base-surface', motionClass: 'animate-glow-pulse' };
    case 'clouds':
      return { gradient: 'from-ink-muted/25 via-base-surface2 to-base-surface', motionClass: 'animate-drift' };
    case 'rain':
      return { gradient: 'from-ink-secondary/30 via-accent-violet/10 to-base-surface', motionClass: 'rain' };
    case 'storm':
      return { gradient: 'from-night-bg/70 via-accent-rose/20 to-base-surface', motionClass: 'rain' };
    case 'snow':
      return { gradient: 'from-base-surface2 via-white to-base-surface', motionClass: 'animate-drift' };
    default:
      return { gradient: 'from-base-surface2 to-base-surface', motionClass: null };
  }
}

export function timeOfDayBucket(date: Date): 'morning' | 'afternoon' | 'night' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 19) return 'afternoon';
  return 'night';
}

/** Generated from real, live weather data — never a hardcoded day/condition (Phase 6b section 5). */
export function weatherContextMessage(weather: RecommendationWeather): string {
  if (weather.isRaining) return '🌧️ צפוי גשם — עדיף לבחור פעילות מקורה.';
  if (weather.isHot) return '🌡️ חם בחוץ — עדיף לשמור את ההליכה לשעות הערב.';
  if (weather.isComfortableOutside) return '☀️ מזג אוויר מעולה — מתאים לטייל בחוץ.';
  if (weather.isCold) return '🧥 קריר בחוץ — כדאי להתלבש בהתאם.';
  return 'מזג האוויר סביר להיום.';
}
