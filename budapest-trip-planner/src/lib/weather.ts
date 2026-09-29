import type { DailyForecast, GeoCoordinates, HourlyForecastPoint, RecommendationWeather, WeatherCondition, WeatherConditionBucket } from '@/types';

/**
 * Weather provider: Open-Meteo (https://open-meteo.com). Chosen specifically
 * because it needs NO API key for non-commercial use — the single biggest
 * risk called out in the brief ("never expose a secret key from a static
 * GitHub Pages site") simply doesn't apply here. If a keyed provider is
 * ever swapped in instead, read the key from `import.meta.env.VITE_WEATHER_API_KEY`
 * (a `.env.local` file, never committed — see `.env.example`) and pass it
 * as a query param/header inside `fetchJson` below; nothing outside this
 * file would need to change, since every caller only ever sees the typed
 * results (`WeatherCondition` / `DailyForecast` / `HourlyForecastPoint`),
 * never the provider's raw response shape.
 */
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const FETCH_TIMEOUT_MS = 8000;

const CURRENT_WEATHER_TTL_MS = 15 * 60 * 1000; // ~15 minutes, per the brief
const FORECAST_TTL_MS = 2 * 60 * 60 * 1000; // ~2 hours, per the brief's 1-3h window

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`weather provider responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

interface WmoInfo {
  condition: WeatherConditionBucket;
  icon: string;
  description: string;
}

/**
 * WMO weather codes are a public, documented standard (used by Open-Meteo
 * and most national weather services) — this table is a translation of
 * that standard, not invented data.
 */
function wmoInfo(code: number): WmoInfo {
  if (code === 0) return { condition: 'clear', icon: '☀️', description: 'בהיר' };
  if (code === 1) return { condition: 'clouds', icon: '🌤️', description: 'בהיר בעיקר' };
  if (code === 2) return { condition: 'clouds', icon: '⛅', description: 'מעונן חלקית' };
  if (code === 3) return { condition: 'clouds', icon: '☁️', description: 'מעונן' };
  if (code === 45 || code === 48) return { condition: 'clouds', icon: '🌫️', description: 'ערפל' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'rain', icon: '🌦️', description: 'טפטוף גשם' };
  if ([61, 80].includes(code)) return { condition: 'rain', icon: '🌧️', description: 'גשם קל' };
  if ([63, 81].includes(code)) return { condition: 'rain', icon: '🌧️', description: 'גשם' };
  if ([65, 66, 67, 82].includes(code)) return { condition: 'rain', icon: '🌧️', description: 'גשם עז' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'snow', icon: '❄️', description: 'שלג' };
  if ([95, 96, 99].includes(code)) return { condition: 'storm', icon: '⛈️', description: 'סופת רעמים' };
  return { condition: 'unknown', icon: '🌡️', description: 'לא ידוע' };
}

interface LocationCache {
  coordinates: GeoCoordinates;
  resolvedAt: number;
}
let locationCache: LocationCache | null = null;

/**
 * Resolves "Budapest, Hungary" to real coordinates via the weather
 * provider's own geocoding endpoint — never a hardcoded/guessed lat/lng.
 * A city's coordinates don't meaningfully change, so this is cached for
 * the whole session once resolved.
 */
export async function resolveBudapestLocation(): Promise<GeoCoordinates | null> {
  if (locationCache) return locationCache.coordinates;
  try {
    const url = `${GEOCODING_URL}?name=${encodeURIComponent('Budapest')}&count=1&language=en&format=json`;
    const data = (await fetchJson(url)) as { results?: { latitude: number; longitude: number; country: string }[] };
    const first = data.results?.[0];
    if (!first) return null;
    const coordinates: GeoCoordinates = { lat: first.latitude, lng: first.longitude };
    locationCache = { coordinates, resolvedAt: Date.now() };
    return coordinates;
  } catch (err) {
    console.warn('[weather] geocoding failed, no coordinates available', err);
    return null;
  }
}

interface CurrentCacheEntry {
  key: string;
  value: WeatherCondition;
  fetchedAt: number;
}
let currentCache: CurrentCacheEntry | null = null;

function locationKey(location: GeoCoordinates): string {
  return `${location.lat.toFixed(3)},${location.lng.toFixed(3)}`;
}

export async function getCurrentWeather(location: GeoCoordinates): Promise<WeatherCondition | null> {
  const key = locationKey(location);
  if (currentCache && currentCache.key === key && Date.now() - currentCache.fetchedAt < CURRENT_WEATHER_TTL_MS) {
    return currentCache.value;
  }
  try {
    const url =
      `${FORECAST_URL}?latitude=${location.lat}&longitude=${location.lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
      `&timezone=auto`;
    const data = (await fetchJson(url)) as {
      current?: {
        time: string;
        temperature_2m: number;
        apparent_temperature: number;
        precipitation: number;
        weather_code: number;
        wind_speed_10m: number;
        relative_humidity_2m: number;
      };
    };
    const c = data.current;
    if (!c) return null;
    const info = wmoInfo(c.weather_code);
    const result: WeatherCondition = {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      precipitationProbability: null, // not part of the `current` block — see daily/hourly for probability
      precipitation: c.precipitation,
      windSpeed: Math.round(c.wind_speed_10m),
      humidity: c.relative_humidity_2m ?? null,
      weatherCode: c.weather_code,
      condition: info.condition,
      icon: info.icon,
      description: info.description,
      timestamp: Date.now(),
    };
    currentCache = { key, value: result, fetchedAt: Date.now() };
    return result;
  } catch (err) {
    console.warn('[weather] getCurrentWeather failed', err);
    return null;
  }
}

interface DailyCacheEntry {
  key: string;
  value: DailyForecast[];
  fetchedAt: number;
}
let dailyCache: DailyCacheEntry | null = null;

/** "YYYY-MM-DD" in the local (Budapest) calendar sense — matches the API's own date strings. */
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Open-Meteo's free forecast typically covers ~16 days ahead — a date
 * beyond what it returns is NOT an error, just "not available yet". Callers
 * must treat a missing date as "תחזית עדיין לא זמינה", never invent one.
 */
export async function getDailyForecast(location: GeoCoordinates, startDate: string, endDate: string): Promise<DailyForecast[] | null> {
  const key = `${locationKey(location)}|${startDate}|${endDate}`;
  if (dailyCache && dailyCache.key === key && Date.now() - dailyCache.fetchedAt < FORECAST_TTL_MS) {
    return dailyCache.value;
  }
  try {
    const url =
      `${FORECAST_URL}?latitude=${location.lat}&longitude=${location.lng}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=auto&start_date=${startDate}&end_date=${endDate}`;
    const data = (await fetchJson(url)) as {
      daily?: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_probability_max: number[];
      };
    };
    const d = data.daily;
    if (!d) return null;
    const result: DailyForecast[] = d.time.map((date, i) => {
      const weatherCode = d.weather_code[i] ?? 0;
      const info = wmoInfo(weatherCode);
      return {
        date,
        minTemperature: Math.round(d.temperature_2m_min[i] ?? 0),
        maxTemperature: Math.round(d.temperature_2m_max[i] ?? 0),
        precipitationProbability: d.precipitation_probability_max[i] ?? null,
        weatherCode,
        condition: info.condition,
        icon: info.icon,
        description: info.description,
      };
    });
    dailyCache = { key, value: result, fetchedAt: Date.now() };
    return result;
  } catch (err) {
    console.warn('[weather] getDailyForecast failed', err);
    return null;
  }
}

export async function getHourlyForecast(location: GeoCoordinates, date: string): Promise<HourlyForecastPoint[] | null> {
  try {
    const url =
      `${FORECAST_URL}?latitude=${location.lat}&longitude=${location.lng}` +
      `&hourly=temperature_2m,precipitation_probability,weather_code` +
      `&timezone=auto&start_date=${date}&end_date=${date}`;
    const data = (await fetchJson(url)) as {
      hourly?: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[] };
    };
    const h = data.hourly;
    if (!h) return null;
    return h.time.map((time, i) => {
      const weatherCode = h.weather_code[i] ?? 0;
      const info = wmoInfo(weatherCode);
      return {
        time,
        temperature: Math.round(h.temperature_2m[i] ?? 0),
        precipitationProbability: h.precipitation_probability[i] ?? null,
        weatherCode,
        condition: info.condition,
        icon: info.icon,
      };
    });
  } catch (err) {
    console.warn('[weather] getHourlyForecast failed', err);
    return null;
  }
}

const COLD_THRESHOLD_C = 8;
const HOT_THRESHOLD_C = 29;
const HIGH_RAIN_PROBABILITY = 50;

/**
 * The small shape the recommendation engine actually reads. Isolates the
 * engine from the provider entirely — scoring never sees a WeatherCondition.
 */
export function toRecommendationWeather(current: WeatherCondition): RecommendationWeather {
  const isRaining = current.condition === 'rain' || current.condition === 'storm' || current.precipitation > 0;
  const isCold = current.temperature < COLD_THRESHOLD_C;
  const isHot = current.temperature > HOT_THRESHOLD_C;
  return {
    condition: current.condition,
    temperature: current.temperature,
    precipitationProbability: current.precipitationProbability,
    isRaining,
    isCold,
    isHot,
    isComfortableOutside: !isRaining && !isCold && !isHot && current.condition !== 'snow' && current.condition !== 'storm',
  };
}

export { toDateStr, HIGH_RAIN_PROBABILITY };
