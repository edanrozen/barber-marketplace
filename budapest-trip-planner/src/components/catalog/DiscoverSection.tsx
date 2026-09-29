import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CategoryIcon, CATEGORY_LABELS } from '@/components/common/CategoryIcon';
import { formatDuration } from '@/lib/time';
import type { Place } from '@/types';

interface DiscoverSectionProps {
  title: string;
  places: Place[];
}

/** One horizontally-scrolling themed row — the Catalog page's "discover Budapest" surface instead of one flat list (Phase 6b). */
export function DiscoverSection({ title, places }: DiscoverSectionProps): JSX.Element | null {
  if (places.length === 0) return null;

  return (
    <div>
      <h2 className="mb-2 px-4 text-sm font-extrabold text-ink-primary">{title}</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
        {places.map((place, i) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={`/place/${place.id}`}
              className="flex w-36 shrink-0 flex-col gap-2 rounded-xl2 border border-base-border bg-base-surface p-3 transition-colors hover:border-accent-gold/40"
            >
              <div className="flex h-16 w-full items-center justify-center rounded-lg bg-gradient-to-br from-accent-gold/25 via-accent-violet/15 to-base-surface2 text-accent-gold">
                <CategoryIcon category={place.category} size={26} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-ink-primary">{place.name}</p>
                {place.subcategory === 'Poker Room' ? (
                  <p className="truncate text-[10px] font-bold text-accent-violet">♠️ Poker Room</p>
                ) : (
                  <p className="truncate text-[11px] text-ink-muted">
                    {CATEGORY_LABELS[place.category]} · {formatDuration(place.estimatedDurationMinutes)}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
