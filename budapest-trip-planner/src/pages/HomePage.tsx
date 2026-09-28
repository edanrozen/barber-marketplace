import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { usePlacesStore, useTripStore, useUserStateStore } from '@/store';
import { getRecommendation, moodOption, type EngineContext } from '@/engine/recommendationEngine';
import type { MoodOption } from '@/engine/moods';
import { MoodGrid } from '@/components/home/MoodGrid';
import { RecommendationCard } from '@/components/home/RecommendationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { getBudapestNow } from '@/lib/time';
import { findNextActivity, timeAvailableMinutes } from '@/lib/tripSchedule';

export function HomePage(): JSX.Element {
  const places = usePlacesStore((s) => s.places);
  const userState = useUserStateStore((s) => s);
  const currentDay = useTripStore((s) => s.currentDay());

  const [selectedMoodId, setSelectedMoodId] = useState<MoodOption['id'] | null>(null);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);

  const hasAnyPlaces = places.length > 0;

  const result = useMemo(() => {
    if (!selectedMoodId) return null;

    const now = getBudapestNow();
    const { next } = findNextActivity(currentDay, now.getHours() * 60 + now.getMinutes());

    const ctx: EngineContext = {
      userState,
      mood: selectedMoodId,
      now,
      timeAvailableMinutes: currentDay ? timeAvailableMinutes(currentDay, now.getHours() * 60 + now.getMinutes()) : null,
      nextActivityTitle: next?.title ?? null,
      excludeIds,
    };

    return getRecommendation(places, ctx);
  }, [selectedMoodId, excludeIds, places, userState, currentDay]);

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
      </div>

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
    </div>
  );
}
