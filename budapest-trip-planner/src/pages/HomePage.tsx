import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Car } from 'lucide-react';
import { usePlacesStore, useTripStore, useUserStateStore } from '@/store';
import { getRecommendation, buildRecommendationContext, moodOption } from '@/engine/recommendationEngine';
import type { MoodOption } from '@/engine/moods';
import { MoodGrid } from '@/components/home/MoodGrid';
import { RecommendationCard } from '@/components/home/RecommendationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { getCurrentTime, formatDuration } from '@/lib/time';

export function HomePage(): JSX.Element {
  const places = usePlacesStore((s) => s.places);
  const userState = useUserStateStore((s) => s);
  const todaysTripDay = useTripStore((s) => s.todaysTripDay);
  const fallbackDay = useTripStore((s) => s.currentDay());

  const [selectedMoodId, setSelectedMoodId] = useState<MoodOption['id'] | null>(null);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);

  const hasAnyPlaces = places.length > 0;
  const now = useMemo(() => getCurrentTime(), []);
  // Prefer the TripDay whose real calendar date is today; fall back to
  // whichever day the Today page tabs currently point at (useful before the
  // trip's real dates are in range, or while testing).
  const currentDay = todaysTripDay(now) ?? fallbackDay ?? null;

  // Live schedule context shown above the mood grid — computed independent
  // of any mood selection so "must leave now" can be caught before the user
  // even picks one.
  const liveContext = useMemo(
    () => buildRecommendationContext({ places, currentDay, userState, mood: null, now }),
    [places, currentDay, userState, now],
  );
  const mustLeaveNow = liveContext.availableMinutes !== null && liveContext.availableMinutes <= 0;

  const result = useMemo(() => {
    if (!selectedMoodId) return null;
    const ctx = buildRecommendationContext({ places, currentDay, userState, mood: selectedMoodId, excludeIds, now });
    return getRecommendation(places, ctx);
  }, [selectedMoodId, excludeIds, places, userState, currentDay, now]);

  function handleSelectMood(id: MoodOption['id']): void {
    setExcludeIds([]);
    setSelectedMoodId(id);
    if (id !== 'surprise_me') {
      useUserStateStore.getState().set({ mood: id });
    }
  }

  function handleAnotherOption(): void {
    if (result?.best) setExcludeIds((prev) => [...prev, result.best!.place.id]);
  }

  function handleBack(): void {
    setSelectedMoodId(null);
    setExcludeIds([]);
  }

  const selectedOption = selectedMoodId ? moodOption(selectedMoodId) : undefined;

  return (
    <div className="flex min-h-full flex-col pb-6">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-extrabold">
          <span className="ml-1">🇭🇺</span> Budapest
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">מה בא לכם לעשות עכשיו?</p>

        {liveContext.nextFixedActivity && (
          <p className="mt-2 text-xs text-ink-muted">
            📍{' '}
            {mustLeaveNow
              ? `זמן לצאת ל-${liveContext.nextFixedActivity.title}!`
              : `${liveContext.availableMinutes !== null ? formatDuration(liveContext.availableMinutes) : ''} פנויות עד "${liveContext.nextFixedActivity.title}"`}
          </p>
        )}
      </div>

      {mustLeaveNow && liveContext.nextFixedActivity ? (
        <div className="mx-4 flex items-center gap-3 rounded-xl2 border border-accent-rose/40 bg-accent-rose/10 p-4">
          <Car size={22} className="shrink-0 text-accent-rose" />
          <div>
            <p className="text-sm font-bold text-accent-rose">אתם צריכים לצאת ל{liveContext.nextFixedActivity.title} עכשיו</p>
            <p className="mt-0.5 text-xs text-ink-secondary">
              הפעילות מתחילה ב-{liveContext.nextFixedActivityStart} — אין זמן פנוי להצעה חדשה כרגע.
            </p>
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
                  onAnotherOption={handleAnotherOption}
                  hasMoreAlternatives={result.alternatives.length > 0}
                />
              ) : (
                <EmptyState
                  emoji="🤔"
                  title="לא מצאנו משהו שמתאים כרגע"
                  description={`לא נמצא מקום ${selectedOption ? `בקטגוריית "${selectedOption.label}"` : ''} שמתאים למיקום, לזמן הפנוי או לשעות הפתיחה כרגע. אפשר לנסות מצב אחר.`}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
