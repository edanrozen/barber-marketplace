import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Car, Clock3, Cross } from 'lucide-react';
import { usePlacesStore, useTripStore, useUserStateStore, useRecommendationHistoryStore } from '@/store';
import {
  getRecommendation,
  buildRecommendationContext,
  getCurrentTripState,
  buildReasons,
  openingHoursCaveat,
  moodOption,
  inferIndoorOutdoor,
} from '@/engine/recommendationEngine';
import type { MoodOption } from '@/engine/moods';
import type { MoodTag, Place, PlaceCategory } from '@/types';
import { MoodGrid } from '@/components/home/MoodGrid';
import { RecommendationCard } from '@/components/home/RecommendationCard';
import { LocationStatus } from '@/components/home/LocationStatus';
import { LocationConsentPrompt } from '@/components/home/LocationConsentPrompt';
import { WeatherCard } from '@/components/home/WeatherCard';
import { WeatherAlternativesPanel } from '@/components/home/WeatherAlternativesPanel';
import { ThinkingCard } from '@/components/home/ThinkingCard';
import { EmptyState } from '@/components/common/EmptyState';
import { getCurrentTime, formatDuration, formatClockTime, minutesToHHMM, nowMinutes } from '@/lib/time';
import { resolveCurrentLocation } from '@/lib/geolocation';
import { useWeatherSync } from '@/hooks/useWeatherSync';
import { timeOfDayBucket } from '@/lib/weatherVisuals';

const CLOCK_TICK_MS = 30_000;
const THINKING_DELAY_MS = 650;
/** Candidate moods tried (besides the one the user actually picked) when hunting for a genuinely indoor real alternative during rain. */
const INDOOR_ALTERNATIVE_MOODS: MoodTag[] = ['hungry_light', 'hungry_a_lot', 'drink', 'coffee_sweet', 'shopping', 'adrenaline', 'sightseeing'];

const HERO_BY_TIME: Record<ReturnType<typeof timeOfDayBucket>, string> = {
  morning: 'from-accent-gold/20 via-base-surface to-base-bg',
  afternoon: 'from-accent-rose/15 via-accent-violet/10 to-base-bg',
  night: 'from-night-bg via-night-surface to-base-bg',
};

export function HomePage(): JSX.Element {
  const places = usePlacesStore((s) => s.places);
  const userState = useUserStateStore((s) => s);
  const todaysTripDay = useTripStore((s) => s.todaysTripDay);
  const fallbackDay = useTripStore((s) => s.currentDay());
  const dayBefore = useTripStore((s) => s.dayBefore);

  useWeatherSync();

  const [selectedMoodId, setSelectedMoodId] = useState<MoodOption['id'] | null>(null);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [avoidCategories, setAvoidCategories] = useState<PlaceCategory[]>([]);
  const [justMarkedDone, setJustMarkedDone] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // A real, ticking clock — the whole point of "what should we do right
  // now" breaks if the page silently goes stale while it's open.
  const [now, setNow] = useState(() => getCurrentTime());
  useEffect(() => {
    const id = setInterval(() => setNow(getCurrentTime()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const timeOfDay = timeOfDayBucket(now);
  const isNight = timeOfDay === 'night';

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

  // A short, intentional "deciding" beat on the INITIAL pick only — repeated
  // taps ("another option") stay snappy. Purely presentational: `result`
  // above is already computed; this just delays revealing it.
  useEffect(() => {
    if (!selectedMoodId) {
      setIsThinking(false);
      return;
    }
    setIsThinking(true);
    const id = setTimeout(() => setIsThinking(false), THINKING_DELAY_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMoodId]);

  // When the current pick is outdoor and it's raining, look for real indoor
  // alternatives across other moods — never hardcoded, always the actual
  // engine + catalog (see engine/recommendationEngine.ts).
  const weatherAlternatives = useMemo((): Place[] => {
    if (!result?.best || !userState.weather?.isRaining) return [];
    if (inferIndoorOutdoor(result.best.place) !== 'outdoor') return [];

    const recentDismissals = useRecommendationHistoryStore.getState().recentDismissals(now);
    const seen = new Set([result.best.place.id]);
    const picks: Place[] = [];
    for (const altMood of INDOOR_ALTERNATIVE_MOODS) {
      if (altMood === selectedMoodId) continue;
      const ctx = buildRecommendationContext({ places, currentDay, previousDay, userState, mood: altMood, recentDismissals, now });
      const altResult = getRecommendation(places, ctx);
      const candidate = altResult.best?.place;
      if (!candidate || seen.has(candidate.id) || inferIndoorOutdoor(candidate) !== 'indoor') continue;
      seen.add(candidate.id);
      picks.push(candidate);
      if (picks.length >= 4) break;
    }
    return picks;
  }, [result?.best, userState.weather?.isRaining, selectedMoodId, places, currentDay, previousDay, userState, now]);

  // A location fix materially improves the pick — but only worth asking for
  // once the user has actually entered this flow, AND only after our own
  // plain-language consent ask (never the browser's native prompt cold).
  // Once the user has answered (either way), this never asks again.
  useEffect(() => {
    if (!selectedMoodId || userState.locationConsent !== 'granted') return;
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
  }, [selectedMoodId, userState.locationConsent]);

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

  function handleAllowLocation(): void {
    useUserStateStore.getState().set({ locationConsent: 'granted' });
  }

  function handleDeclineLocation(): void {
    useUserStateStore.getState().set({ locationConsent: 'declined' });
  }

  const selectedOption = selectedMoodId ? moodOption(selectedMoodId) : undefined;
  const showLocationConsent = !!selectedMoodId && userState.locationConsent === 'unknown';

  return (
    <div className="flex min-h-full flex-col pb-6">
      <div className={`bg-gradient-to-b ${HERO_BY_TIME[timeOfDay]} px-4 pt-6 pb-5`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-extrabold ${isNight ? 'text-night-ink' : 'text-ink-primary'}`}>
            <span className="ml-1">🇭🇺</span> BUDAPEST
          </h1>
          <span className={`flex items-center gap-1 text-xs ${isNight ? 'text-night-ink/70' : 'text-ink-muted'}`}>
            <Clock3 size={13} />
            עכשיו {minutesToHHMM(nowMinutes(now))}
          </span>
        </div>
        <p className={`mt-1 text-sm font-medium ${isNight ? 'text-night-ink/90' : 'text-ink-secondary'}`}>מה בא לכם עכשיו?</p>
        <p className="mt-0.5 text-xs font-medium text-accent-teal">לא התבזת לא נהנת 🎉</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            to="/medical"
            className="flex w-fit items-center gap-1.5 rounded-full border border-accent-rose/40 bg-accent-rose/10 px-3 py-1.5 text-xs font-bold text-accent-rose transition-colors hover:bg-accent-rose/20"
          >
            <Cross size={13} />
            🚑 עזרה רפואית
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {tripState.nextFixedActivity && (
            <p className={`text-xs ${isNight ? 'text-night-ink/70' : 'text-ink-muted'}`}>
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

      <div className="-mt-2 mb-2">
        <WeatherCard />
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

              {showLocationConsent && (
                <LocationConsentPrompt onAllow={handleAllowLocation} onNotNow={handleDeclineLocation} />
              )}

              <AnimatePresence mode="wait">
                {isThinking ? (
                  <ThinkingCard key="thinking" />
                ) : !hasAnyPlaces ? (
                  <EmptyState
                    key="empty-catalog"
                    emoji="🗺️"
                    title="עדיין אין מקומות במאגר"
                    description="הוסיפו מקומות ל'כל האפשרויות' כדי שהמנוע יוכל להמליץ לכם על משהו."
                  />
                ) : result?.best ? (
                  <motion.div key={result.best.place.id} className="flex flex-col gap-3">
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-bold text-accent-gold"
                    >
                      🔥 מצאתי לכם משהו
                    </motion.p>
                    <RecommendationCard
                      scored={result.best}
                      explanation={result.explanation}
                      reasons={buildReasons(result.best, result.context)}
                      hoursCaveat={openingHoursCaveat(result.best, result.context)}
                      onGo={handleGo}
                      onAnotherOption={handleAnotherOption}
                      onDismiss={handleDismiss}
                      onMarkDone={handleMarkDone}
                      hasMoreAlternatives={result.alternatives.length > 0}
                      justMarkedDone={justMarkedDone}
                    />
                    <WeatherAlternativesPanel alternatives={weatherAlternatives} />
                  </motion.div>
                ) : (
                  <EmptyState
                    key="no-match"
                    emoji="🤔"
                    title="לא מצאנו משהו שמתאים בזמן שנשאר לכם"
                    description={
                      tripState.nextFixedActivity && tripState.availableMinutes !== null
                        ? `הדבר הבא שלכם: ${tripState.nextFixedActivity.title}. צריך לצאת בעוד ${formatDuration(tripState.availableMinutes)}.`
                        : `לא נמצא מקום ${selectedOption ? `בקטגוריית "${selectedOption.label}"` : ''} שמתאים למיקום או לשעות הפתיחה כרגע. אפשר לנסות מצב אחר.`
                    }
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
