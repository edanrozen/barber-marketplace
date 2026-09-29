import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import type { Place } from '@/types';

interface WeatherAlternativesPanelProps {
  alternatives: Place[];
}

/**
 * Only rendered by HomePage when the current pick is genuinely outdoor and
 * it's raining — real catalog places (computed via the recommendation
 * engine, never hardcoded), never a generic warning with no way forward.
 */
export function WeatherAlternativesPanel({ alternatives }: WeatherAlternativesPanelProps): JSX.Element | null {
  if (alternatives.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl2 border border-accent-violet/30 bg-accent-violet/5 p-4"
    >
      <p className="text-sm font-semibold text-ink-primary">🌧️ המזג אוויר פחות מתאים לזה כרגע</p>
      <p className="mt-2 text-xs font-medium text-ink-secondary">מה כן מתאים עכשיו?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {alternatives.map((place) => (
          <Link
            key={place.id}
            to={`/place/${place.id}`}
            className="flex items-center gap-1.5 rounded-full border border-base-border bg-base-surface px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-accent-violet/40 hover:text-accent-violet"
          >
            <CategoryIcon category={place.category} size={13} />
            {place.name}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
