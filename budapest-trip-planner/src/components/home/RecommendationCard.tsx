import { motion } from 'framer-motion';
import { Clock, MapPin, RefreshCcw, Navigation } from 'lucide-react';
import type { ScoredPlace } from '@/types';
import { CATEGORY_LABELS, CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDistance } from '@/lib/distance';
import { formatDuration } from '@/lib/time';

interface RecommendationCardProps {
  scored: ScoredPlace;
  explanation: string | null;
  onAnotherOption: () => void;
  hasMoreAlternatives: boolean;
}

function mapsUrl(scored: ScoredPlace): string {
  const { lat, lng } = scored.place.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function RecommendationCard({
  scored,
  explanation,
  onAnotherOption,
  hasMoreAlternatives,
}: RecommendationCardProps): JSX.Element {
  const { place } = scored;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl2 border border-accent-gold/30 bg-base-surface shadow-glow"
    >
      <div className="relative h-40 w-full bg-base-surface2">
        {place.image ? (
          <img src={place.image} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <CategoryIcon category={place.category} size={40} />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-accent-gold">
          🎯 הבחירה שלי בשבילכם
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <CategoryIcon category={place.category} size={14} />
            <span>{CATEGORY_LABELS[place.category]}</span>
            {place.priceLevel && <span>· {'₪'.repeat(place.priceLevel)}</span>}
          </div>
          <h2 className="text-lg font-bold text-ink-primary">{place.name}</h2>
        </div>

        {explanation && (
          <p className="rounded-lg bg-base-surface2 p-3 text-sm leading-relaxed text-ink-secondary">
            {explanation}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-ink-secondary">
          {scored.distanceKm !== null && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {formatDistance(scored.distanceKm)}
            </span>
          )}
          {scored.travelMinutes !== null && (
            <span className="flex items-center gap-1">
              <Navigation size={13} /> {scored.travelMinutes} דק׳ הליכה
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={13} /> {formatDuration(place.estimatedDurationMinutes)} במקום
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <a
            href={mapsUrl(scored)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full bg-accent-gold py-2.5 text-center text-sm font-bold text-base-bg transition-transform active:scale-95"
          >
            יאללה לשם 🚶
          </a>
          {hasMoreAlternatives && (
            <button
              type="button"
              onClick={onAnotherOption}
              className="flex items-center gap-1.5 rounded-full border border-base-border px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
            >
              <RefreshCcw size={14} />
              אופציה אחרת
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
