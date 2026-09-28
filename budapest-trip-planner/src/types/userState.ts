import type { GeoCoordinates, MoodTag, PriceLevel } from './place';

export type Level0to3 = 0 | 1 | 2 | 3;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface WeatherSnapshot {
  condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'unknown';
  tempC: number;
}

/**
 * Live snapshot of "where the humans are right now". This is the context the
 * recommendation engine reads on every call — it is never persisted as a
 * point-in-time log, only the current values.
 */
export interface UserState {
  currentLocation: GeoCoordinates | null;
  /** Free-text fallback when GPS isn't available/trusted (e.g. "Buda Castle"). */
  currentLocationLabel: string | null;

  hungerLevel: Level0to3;
  thirstLevel: Level0to3;
  energyLevel: EnergyLevel;
  mood: MoodTag | null;

  budget: PriceLevel;
  groupSize: number;

  weather: WeatherSnapshot | null;
}

export const DEFAULT_USER_STATE: UserState = {
  currentLocation: null,
  currentLocationLabel: null,
  hungerLevel: 1,
  thirstLevel: 1,
  energyLevel: 3,
  mood: null,
  budget: 3,
  groupSize: 2,
  weather: null,
};
