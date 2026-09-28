import { Link } from 'react-router-dom';
import type { Place } from '@/types';
import { CATEGORY_LABELS, CategoryIcon } from '@/components/common/CategoryIcon';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDuration } from '@/lib/time';

export function PlaceCard({ place }: { place: Place }): JSX.Element {
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
          <StatusBadge status={place.status} />
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
          <CategoryIcon category={place.category} size={12} />
          {CATEGORY_LABELS[place.category]}
          {place.priceLevel && <span>· {'₪'.repeat(place.priceLevel)}</span>}
          <span>· {formatDuration(place.estimatedDurationMinutes)}</span>
        </p>
        {place.location && <p className="mt-1 truncate text-xs text-ink-secondary">{place.location}</p>}
      </div>
    </Link>
  );
}
