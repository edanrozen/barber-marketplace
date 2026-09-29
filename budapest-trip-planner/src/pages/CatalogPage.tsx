import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { PlaceCategory } from '@/types';
import { usePlacesStore, useUserStateStore } from '@/store';
import { FilterBar } from '@/components/catalog/FilterBar';
import { PlaceCard } from '@/components/catalog/PlaceCard';
import { DiscoverSection } from '@/components/catalog/DiscoverSection';
import { SearchBar } from '@/components/catalog/SearchBar';
import { SearchEmptyState } from '@/components/catalog/SearchEmptyState';
import { EmptyState } from '@/components/common/EmptyState';
import { isOpenAt } from '@/lib/time';
import { haversineKm } from '@/lib/distance';
import { searchPlaces } from '@/lib/search';
import { inferIndoorOutdoor } from '@/engine/recommendationEngine';

const SECTION_SIZE = 8;

export function CatalogPage(): JSX.Element {
  const allPlaces = usePlacesStore((s) => s.places);
  const userState = useUserStateStore((s) => s);
  // Medical facilities only surface through the dedicated Medical screen —
  // excluded before anything else touches this page's notion of "the catalog".
  const places = useMemo(() => allPlaces.filter((p) => p.category !== 'medical'), [allPlaces]);
  const [activeCategories, setActiveCategories] = useState<PlaceCategory[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [hideVisited, setHideVisited] = useState(false);
  const [query, setQuery] = useState('');
  const isSearching = query.trim().length > 0;
  const searchResults = useMemo(() => (isSearching ? searchPlaces(places, query) : []), [places, query, isSearching]);

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

  // "Discover" sections — real derived slices of the actual catalog, never
  // a hardcoded list (Phase 6b section 22). Each place can appear in more
  // than one section; that's fine, this isn't a partition.
  const unvisited = useMemo(() => places.filter((p) => !p.visited), [places]);

  const popular = useMemo(
    () =>
      [...unvisited]
        .filter((p) => p.rating !== undefined)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, SECTION_SIZE),
    [unvisited],
  );

  const nearYou = useMemo(() => {
    const loc = userState.currentLocation;
    if (!loc) return [];
    return [...unvisited]
      .filter((p) => p.coordinates)
      .sort((a, b) => haversineKm(loc, a.coordinates!) - haversineKm(loc, b.coordinates!))
      .slice(0, SECTION_SIZE);
  }, [unvisited, userState.currentLocation]);

  const tonight = useMemo(
    () => unvisited.filter((p) => p.category === 'bar' || p.category === 'club' || p.category === 'casino').slice(0, SECTION_SIZE),
    [unvisited],
  );

  const foodMood = useMemo(() => unvisited.filter((p) => p.category === 'food').slice(0, SECTION_SIZE), [unvisited]);

  const desserts = useMemo(() => unvisited.filter((p) => p.category === 'dessert').slice(0, SECTION_SIZE), [unvisited]);

  const weatherMatch = useMemo(() => {
    const weather = userState.weather;
    if (!weather) return [];
    const wantIndoor = weather.isRaining;
    return unvisited.filter((p) => inferIndoorOutdoor(p) === (wantIndoor ? 'indoor' : 'outdoor')).slice(0, SECTION_SIZE);
  }, [unvisited, userState.weather]);

  const featuredIds = useMemo(
    () => new Set([...popular, ...nearYou, ...tonight, ...foodMood, ...desserts, ...weatherMatch].map((p) => p.id)),
    [popular, nearYou, tonight, foodMood, desserts, weatherMatch],
  );
  const maybeYoullLike = useMemo(
    () => unvisited.filter((p) => !featuredIds.has(p.id)).slice(0, SECTION_SIZE),
    [unvisited, featuredIds],
  );

  return (
    <div className="flex min-h-full flex-col gap-5 pb-6">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold">לגלות</h1>
        <p className="mt-1 text-sm text-ink-secondary">{places.length} מקומות במאגר לגלות בבודפשט</p>
      </div>

      <SearchBar value={query} onChange={setQuery} />

      {isSearching ? (
        <div className="px-4">
          {searchResults.length === 0 ? (
            <SearchEmptyState query={query} onClear={() => setQuery('')} />
          ) : (
            <>
              <p className="mb-2 text-xs font-medium text-ink-muted">{searchResults.length} תוצאות עבור "{query}"</p>
              <div className="flex flex-col gap-2">
                {searchResults.map((place, i) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <PlaceCard
                      place={place}
                      distanceKm={
                        userState.currentLocation && place.coordinates
                          ? haversineKm(userState.currentLocation, place.coordinates)
                          : undefined
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <DiscoverSection title="🔥 פופולרי" places={popular} />
          <DiscoverSection title="📍 קרוב אליכם" places={nearYou} />
          <DiscoverSection title="🍸 מתאים להערב" places={tonight} />
          <DiscoverSection title="🍔 לפי מצב רוח" places={foodMood} />
          <DiscoverSection title="🍰 קינוחים בסביבה" places={desserts} />
          <DiscoverSection
            title={userState.weather?.isRaining ? '🌧️ מתאים למזג האוויר' : '☀️ מתאים למזג האוויר'}
            places={weatherMatch}
          />
          <DiscoverSection title="✨ אולי תאהבו" places={maybeYoullLike} />

          <div>
            <h2 className="mb-2 px-4 text-sm font-extrabold text-ink-primary">🔍 כל האפשרויות</h2>
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
              <div className="mt-3 flex flex-col gap-2 px-4">
                {filtered.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
