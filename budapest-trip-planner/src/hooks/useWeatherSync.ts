import { useEffect } from 'react';
import { useTripStore, useUserStateStore, useWeatherStore } from '@/store';
import { toRecommendationWeather } from '@/lib/weather';

/**
 * Single place that (a) kicks off the weather fetches (both are internally
 * cache-guarded, so calling this from every page that needs weather is
 * cheap — see useWeatherStore's TTL checks) and (b) keeps
 * `userState.weather` — the one field the recommendation engine actually
 * reads — in sync with the latest real fetch. UI components read
 * `useWeatherStore` directly for display; only the engine-facing summary
 * goes through UserState.
 */
export function useWeatherSync(): void {
  const ensureCurrentWeather = useWeatherStore((s) => s.ensureCurrentWeather);
  const ensureDailyForecast = useWeatherStore((s) => s.ensureDailyForecast);
  const current = useWeatherStore((s) => s.current);
  const plan = useTripStore((s) => s.plan);

  useEffect(() => {
    ensureCurrentWeather();
    const days = plan.days;
    if (days.length > 0) {
      const start = days[0]?.date;
      const end = days[days.length - 1]?.date;
      if (start && end) ensureDailyForecast(start, end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    useUserStateStore.getState().set({ weather: current ? toRecommendationWeather(current) : null });
  }, [current]);
}
