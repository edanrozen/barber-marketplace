/**
 * Raw weather-provider shapes (Open-Meteo, see lib/weather.ts). Separate
 * from `RecommendationWeather` (types/userState.ts), which is the small,
 * pre-digested shape the recommendation engine actually reads — the engine
 * should never need to know which provider or which raw fields it came from.
 */

export type WeatherConditionBucket = 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'unknown';

export interface WeatherCondition {
  temperature: number;
  feelsLike: number;
  /** 0-100, null when the provider didn't return one for this point. */
  precipitationProbability: number | null;
  /** mm */
  precipitation: number;
  /** km/h */
  windSpeed: number;
  /** 0-100, null when unavailable. */
  humidity: number | null;
  /** Raw WMO weather code from the provider — kept for debugging/future use. */
  weatherCode: number;
  condition: WeatherConditionBucket;
  icon: string;
  description: string;
  /** ms epoch */
  timestamp: number;
}

export interface DailyForecast {
  /** "YYYY-MM-DD" */
  date: string;
  minTemperature: number;
  maxTemperature: number;
  precipitationProbability: number | null;
  weatherCode: number;
  condition: WeatherConditionBucket;
  icon: string;
  description: string;
}

export interface HourlyForecastPoint {
  /** ISO timestamp */
  time: string;
  temperature: number;
  precipitationProbability: number | null;
  weatherCode: number;
  condition: WeatherConditionBucket;
  icon: string;
}
