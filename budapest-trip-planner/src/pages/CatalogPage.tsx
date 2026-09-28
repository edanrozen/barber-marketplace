import { useMemo, useState } from 'react';
import type { PlaceCategory } from '@/types';
import { usePlacesStore } from '@/store';
import { FilterBar } from '@/components/catalog/FilterBar';
import { PlaceCard } from '@/components/catalog/PlaceCard';
import { EmptyState } from '@/components/common/EmptyState';
import { isOpenAt } from '@/lib/time';

export function CatalogPage(): JSX.Element {
  const places = usePlacesStore((s) => s.places);
  const [activeCategories, setActiveCategories] = useState<PlaceCategory[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [hideVisited, setHideVisited] = useState(false);

  const filtered = useMemo(() => {
    const now = new Date();
    return places.filter((place) => {
      if (activeCategories.length > 0 && !activeCategories.includes(place.category)) return false;
      if (openNowOnly && !isOpenAt(place.openingHours, now)) return false;
      if (hideVisited && place.visited) return false;
      return true;
    });
  }, [places, activeCategories, openNowOnly, hideVisited]);

  function toggleCategory(category: PlaceCategory): void {
    setActiveCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold">כל האפשרויות</h1>
        <p className="mt-1 text-sm text-ink-secondary">{places.length} מקומות במאגר</p>
      </div>

      <FilterBar
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        openNowOnly={openNowOnly}
        onToggleOpenNow={() => setOpenNowOnly((v) => !v)}
        hideVisited={hideVisited}
        onToggleHideVisited={() => setHideVisited((v) => !v)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          emoji="🗺️"
          title={places.length === 0 ? 'עדיין אין מקומות במאגר' : 'אין תוצאות לפילטרים האלה'}
          description={
            places.length === 0
              ? 'הוסיפו מקומות למאגר (src/data/places.seed.ts או דרך ה-store) כדי לראות אותם כאן.'
              : 'ניקוי חלק מהפילטרים יחזיר תוצאות.'
          }
        />
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {filtered.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
