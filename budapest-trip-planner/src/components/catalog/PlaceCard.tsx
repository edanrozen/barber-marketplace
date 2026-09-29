import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Place } from '@/types';
import { CATEGORY_LABELS, CategoryIcon } from '@/components/common/CategoryIcon';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDuration } from '@/lib/time';
import { formatDistance } from '@/lib/distance';

interface PlaceCardProps {
  place: Place;
  /** Straight-line distance from the viewer's current reference point, if GPS is available — omitted when unknown, never guessed. */
  distanceKm?: number | undefined;
}

export function PlaceCard({ place, distanceKm }: PlaceCardProps): JSX.Element {
  return (
    <Link
      to={`/place/${place.id}`}
      className="flex gap-3 rounded-xl2 border border-base-border bg-base-surface p-3 transition-colors hover:border-accent-gold/30"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-base-surface2 text-ink-muted">
        {place.image ? (
          <img src={place.image} alt={place.name} className="h-full w-full rounded-lg object-cover" />
        ) : (
          <CategoryIcon category={place.category} size={26} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink-primary">{place.name}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {place.rating !== undefined && (
              <span className="flex flex-col items-end leading-tight">
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-accent-gold">
                  <Star size={11} fill="currentColor" /> {place.rating.toFixed(1)}
                </span>
                {place.reviewCount !== undefined && (
                  <span className="text-[9px] text-ink-muted">{place.reviewCount.toLocaleString()}+ ביקורות</span>
                )}
              </span>
            )}
            <StatusBadge status={place.status} />
          </div>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-ink-muted">
          <CategoryIcon category={place.category} size={12} />
          {CATEGORY_LABELS[place.category]}
          {place.subcategory && place.subcategory === 'Poker Room' ? (
            <span className="rounded-full bg-accent-violet/15 px-1.5 py-0.5 text-[10px] font-bold text-accent-violet">
              ♠️ Poker Room
            </span>
          ) : (
            place.subcategory && <span>· {place.subcategory}</span>
          )}
          {place.priceLevel && <span>· {'₪'.repeat(place.priceLevel)}</span>}
          <span>· {formatDuration(place.estimatedDurationMinutes)}</span>
          {distanceKm !== undefined && <span>· {formatDistance(distanceKm)}</span>}
        </p>
        {place.location && <p className="mt-1 truncate text-xs text-ink-secondary">{place.location}</p>}
      </div>
    </Link>
  );
}
