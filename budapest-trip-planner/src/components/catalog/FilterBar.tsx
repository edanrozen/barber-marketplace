import clsx from 'clsx';
import type { PlaceCategory } from '@/types';
import { CATEGORY_LABELS } from '@/components/common/CategoryIcon';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as PlaceCategory[];

interface FilterBarProps {
  activeCategories: PlaceCategory[];
  onToggleCategory: (category: PlaceCategory) => void;
  openNowOnly: boolean;
  onToggleOpenNow: () => void;
  hideVisited: boolean;
  onToggleHideVisited: () => void;
}

export function FilterBar({
  activeCategories,
  onToggleCategory,
  openNowOnly,
  onToggleOpenNow,
  hideVisited,
  onToggleHideVisited,
}: FilterBarProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2 px-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((category) => {
          const active = activeCategories.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggleCategory(category)}
              className={clsx(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' : 'border-base-border text-ink-secondary',
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onToggleOpenNow}
          className={clsx(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            openNowOnly ? 'border-accent-teal bg-accent-teal/10 text-accent-teal' : 'border-base-border text-ink-secondary',
          )}
        >
          פתוח עכשיו
        </button>
        <button
          type="button"
          onClick={onToggleHideVisited}
          className={clsx(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            hideVisited ? 'border-accent-teal bg-accent-teal/10 text-accent-teal' : 'border-base-border text-ink-secondary',
          )}
        >
          עדיין לא ביקרנו
        </button>
      </div>
    </div>
  );
}
