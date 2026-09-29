import { create } from 'zustand';
import type { DailyForecast, GeoCoordinates, WeatherCondition } from '@/types';
import { getCurrentWeather, getDailyForecast, resolveBudapestLocation } from '@/lib/weather';

const CURRENT_TTL_MS = 15 * 60 * 1000;
const DAILY_TTL_MS = 2 * 60 * 60 * 1000;

interface WeatherStore {
  location: GeoCoordinates | null;

  current: WeatherCondition | null;
  currentLoading: boolean;
  currentError: boolean;
  currentFetchedAt: number | null;

  daily: DailyForecast[] | null;
  dailyLoading: boolean;
  dailyError: boolean;
  dailyFetchedAt: number | null;
  dailyRange: { start: string; end: string } | null;

  /**
   * Idempotent — safe to call from any screen on mount. Re-fetches only
   * once the cached value is actually stale, so switching moods or
   * re-visiting Home never re-hits the network (per the brief's caching
   * requirement). Never throws: a failure just sets the error flag.
   */
  ensureCurrentWeather: () => Promise<void>;
  ensureDailyForecast: (startDate: string, endDate: string) => Promise<void>;
}

export const useWeatherStore = create<WeatherStore>()((set, get) => ({
  location: null,
  current: null,
  currentLoading: false,
  currentError: false,
  currentFetchedAt: null,
  daily: null,
  dailyLoading: false,
  dailyError: false,
  dailyFetchedAt: null,
  dailyRange: null,

  ensureCurrentWeather: async () => {
    const state = get();
    if (state.currentLoading) return;
    if (state.current && state.currentFetchedAt && Date.now() - state.currentFetchedAt < CURRENT_TTL_MS) return;

    set({ currentLoading: true, currentError: false });
    const location = state.location ?? (await resolveBudapestLocation());
    if (!location) {
      set({ currentLoading: false, currentError: true });
      return;
    }
    const weather = await getCurrentWeather(location);
    if (!weather) {
      set({ currentLoading: false, currentError: true, location });
      return;
    }
    set({ current: weather, currentFetchedAt: Date.now(), currentLoading: false, currentError: false, location });
  },

  ensureDailyForecast: async (startDate, endDate) => {
    const state = get();
    const sameRange = state.dailyRange?.start === startDate && state.dailyRange?.end === endDate;
    if (state.dailyLoading) return;
    if (sameRange && state.daily && state.dailyFetchedAt && Date.now() - state.dailyFetchedAt < DAILY_TTL_MS) return;

    set({ dailyLoading: true, dailyError: false });
    const location = state.location ?? (await resolveBudapestLocation());
    if (!location) {
      set({ dailyLoading: false, dailyError: true });
      return;
    }
    const forecast = await getDailyForecast(location, startDate, endDate);
    if (!forecast) {
      set({ dailyLoading: false, dailyError: true, location });
      return;
    }
    set({
      daily: forecast,
      dailyFetchedAt: Date.now(),
      dailyRange: { start: startDate, end: endDate },
      dailyLoading: false,
      dailyError: false,
      location,
    });
  },
}));
