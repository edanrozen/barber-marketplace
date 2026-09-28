import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Car, Clock3 } from 'lucide-react';
import { usePlacesStore, useTripStore, useUserStateStore, useRecommendationHistoryStore } from '@/store';
import {
  getRecommendation,
  buildRecommendationContext,
  getCurrentTripState,
  buildReasons,
  openingHoursCaveat,
  moodOption,
} from '@/engine/recommendationEngine';
import type { MoodOption } from '@/engine/moods';
import type { PlaceCategory } from '@/types';
import { MoodGrid } from '@/components/home/MoodGrid';
import { RecommendationCard } from '@/components/home/RecommendationCard';
import { LocationStatus } from '@/components/home/LocationStatus';
import { EmptyState } from '@/components/common/EmptyState';
import { getCurrentTime, formatDuration, formatClockTime, minutesToHHMM, nowMinutes } from '@/lib/time';
import { resolveCurrentLocation } from '@/lib/geolocation';

const CLOCK_TICK_MS = 30_000;

export function HomePage(): JSX.Element {
  const places = usePlacesStore((s) => s.places);
  const userState = useUserStateStore((s) => s);
  const todaysTripDay = useTripStore((s) => s.todaysTripDay);
  const fallbackDay = useTripStore((s) => s.currentDay());
  const dayBefore = useTripStore((s) => s.dayBefore);

  const [selectedMoodId, setSelectedMoodId] = useState<MoodOption['id'] | null>(null);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [avoidCategories, setAvoidCategories] = useState<PlaceCategory[]>([]);
  const [justMarkedDone, setJustMarkedDone] = useState(false);

  // A real, ticking clock — the whole point of "what should we do right
  // now" breaks if the page silently goes stale while it's open.
  const [now, setNow] = useState(() => getCurrentTime());
  useEffect(() => {
    const id = setInterval(() => setNow(getCurrentTime()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const hasAnyPlaces = places.length > 0;
  // Prefer the TripDay whose real calendar date is today; fall back to
  // whichever day the Today page tabs currently point at (useful before the
  // trip's real dates are in range, or while testing).
  const currentDay = todaysTripDay(now) ?? fallbackDay ?? null;
  const previousDay = (currentDay ? dayBefore(currentDay) : undefined) ?? null;

  const tripState = useMemo(
    () => getCurrentTripState({ places, currentDay, previousDay, userState, now }),
    [places, currentDay, previousDay, userState, now],
  );
  const mustPause = tripState.availableMinutes !== null && tripState.availableMinutes <= 0;

  const result = useMemo(() => {
    if (!selectedMoodId) return null;
    const recentDismissals = useRecommendationHistoryStore.getState().recentDismissals(now);
    const ctx = buildRecommendationContext({
      places,
      currentDay,
      previousDay,
      userState,
      mood: selectedMoodId,
      excludeIds,
      recentDismissals,
      now,
    });
    return getRecommendation(places, ctx, { avoidCategories });
    // avoidCategories/excludeIds only ever change via explicit user actions below, never reactively from `result` itself.
  }, [selectedMoodId, excludeIds, avoidCategories, places, userState, currentDay, previousDay, now]);

  // A location fix materially improves the pick — but only worth asking for once the user has actually entered this flow.
  useEffect(() => {
    if (!selectedMoodId) return;
    const fallbackPlace = tripState.nextFixedActivity?.placeId
      ? places.find((p) => p.id === tripState.nextFixedActivity?.placeId) ?? null
      : null;
    resolveCurrentLocation(userState.currentLocation, fallbackPlace).then((resolved) => {
      useUserStateStore.getState().set({
        ...(resolved.coordinates ? { currentLocation: resolved.coordinates } : {}),
        locationSource: resolved.source,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMoodId]);

  useEffect(() => {
    if (result?.best) {
      useRecommendationHistoryStore.getState().logResult(result.best.place.id, selectedMoodId, 'recommended');
    }
  }, [result?.best?.place.id, selectedMoodId]);

  function handleSelectMood(id: MoodOption['id']): void {
    setExcludeIds([]);
    setAvoidCategories([]);
    setJustMarkedDone(false);
    setSelectedMoodId(id);
    if (id !== 'surprise_me') {
      useUserStateStore.getState().set({ mood: id });
    }
  }

  function handleAnotherOption(): void {
    if (!result?.best) return;
    const shown = result.best.place;
    setExcludeIds((prev) => [...prev, shown.id]);
    setAvoidCategories((prev) => (prev.includes(shown.category) ? prev : [...prev, shown.category]));
    setJustMarkedDone(false);
  }

  function handleDismiss(): void {
    if (!result?.best) return;
    const shown = result.best.place;
    useRecommendationHistoryStore.getState().dismiss(shown.id, selectedMoodId);
    setExcludeIds((prev) => [...prev, shown.id]);
    setJustMarkedDone(false);
  }

  function handleGo(): void {
    if (!result?.best) return;
    useRecommendationHistoryStore.getState().logResult(result.best.place.id, selectedMoodId, 'selected');
  }

  function handleMarkDone(): void {
    if (!result?.best) return;
    usePlacesStore.getState().setStatus(result.best.place.id, 'DONE');
    useRecommendationHistoryStore.getState().logResult(result.best.place.id, selectedMoodId, 'done');
    setJustMarkedDone(true);
  }

  function handleBack(): void {
    setSelectedMoodId(null);
    setExcludeIds([]);
    setAvoidCategories([]);
    setJustMarkedDone(false);
  }

  const selectedOption = selectedMoodId ? moodOption(selectedMoodId) : undefined;

  return (
    <div className="flex min-h-full flex-col pb-6">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">
            <span className="ml-1">🇭🇺</span> Budapest
          </h1>
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <Clock3 size={13} />
            עכשיו {minutesToHHMM(nowMinutes(now))}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-secondary">מה בא לכם עכשיו?</p>
        <div className="mt-2 flex items-center justify-between">
          {tripState.nextFixedActivity && (
            <p className="text-xs text-ink-muted">
              📍{' '}
              {tripState.currentActivity
                ? `אתם באמצע "${tripState.currentActivity.title}" כרגע`
                : mustPause
                  ? `זמן לצאת ל-${tripState.nextFixedActivity.title}!`
                  : `${tripState.availableMinutes !== null ? formatDuration(tripState.availableMinutes) : ''} פנויות עד "${tripState.nextFixedActivity.title}"`}
            </p>
          )}
          <LocationStatus source={userState.locationSource} />
        </div>
      </div>

      {mustPause ? (
        <div className="mx-4 flex items-center gap-3 rounded-xl2 border border-accent-rose/40 bg-accent-rose/10 p-4">
          <Car size={22} className="shrink-0 text-accent-rose" />
          <div>
            {tripState.currentActivity ? (
              <>
                <p className="text-sm font-bold text-accent-rose">אתם באמצע "{tripState.currentActivity.title}" עכשיו</p>
                <p className="mt-0.5 text-xs text-ink-secondary">כשזה יסתיים נשמח להמליץ על הצעד הבא.</p>
              </>
            ) : tripState.nextFixedActivity ? (
              <>
                <p className="text-sm font-bold text-accent-rose">אתם צריכים לצאת ל{tripState.nextFixedActivity.title} עכשיו</p>
                <p className="mt-0.5 text-xs text-ink-secondary">
                  הפעילות מתחילה ב-{formatClockTime(tripState.nextFixedActivity.startTime)} — אין זמן פנוי להצעה חדשה כרגע.
                </p>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!selectedMoodId ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MoodGrid onSelect={handleSelectMood} />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col gap-4 px-4"
            >
              <button
                type="button"
                onClick={handleBack}
                className="flex w-fit items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
              >
                <ArrowRight size={16} />
                חזרה לבחירת מצב
              </button>

              {!hasAnyPlaces ? (
                <EmptyState
                  emoji="🗺️"
                  title="עדיין אין מקומות במאגר"
                  description="הוסיפו מקומות ל'כל האפשרויות' כדי שהמנוע יוכל להמליץ לכם על משהו."
                />
              ) : result?.best ? (
                <RecommendationCard
                  scored={result.best}
                  explanation={result.explanation}
                  reasons={buildReasons(result.best, result.context)}
                  hoursCaveat={openingHoursCaveat(result.best)}
                  onGo={handleGo}
                  onAnotherOption={handleAnotherOption}
                  onDismiss={handleDismiss}
                  onMarkDone={handleMarkDone}
                  hasMoreAlternatives={result.alternatives.length > 0}
                  justMarkedDone={justMarkedDone}
                />
              ) : (
                <EmptyState
                  emoji="🤔"
                  title="לא מצאנו משהו שמתאים בזמן שנשאר לכם"
                  description={
                    tripState.nextFixedActivity && tripState.availableMinutes !== null
                      ? `הדבר הבא שלכם: ${tripState.nextFixedActivity.title}. צריך לצאת בעוד ${formatDuration(tripState.availableMinutes)}.`
                      : `לא נמצא מקום ${selectedOption ? `בקטגוריית "${selectedOption.label}"` : ''} שמתאים למיקום או לשעות הפתיחה כרגע. אפשר לנסות מצב אחר.`
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
