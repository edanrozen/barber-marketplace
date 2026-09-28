/**
 * Core catalog entity. Every physical place we might send the group to —
 * restaurant, bar, club, attraction, shop, adrenaline activity — is a Place.
 * No place data ships with the app; this file only defines the shape.
 */

export type PlaceCategory =
  | 'food'
  | 'cafe'
  | 'bar'
  | 'club'
  | 'attraction'
  | 'shopping'
  | 'adrenaline'
  | 'water';

export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';

/** 1 = ₪, 4 = ₪₪₪₪. Matches UserState.budget so they compare directly. */
export type PriceLevel = 1 | 2 | 3 | 4;

/**
 * Lifecycle status of a place for *this* trip. AVAILABLE is the only status
 * the recommendation engine will surface unprompted — everything else is
 * either finished, explicitly rejected, or needs a human step first.
 */
export type PlaceStatus =
  | 'AVAILABLE'
  | 'DONE'
  | 'SKIPPED'
  | 'NOT_RELEVANT'
  | 'CLOSED'
  | 'BOOKING_REQUIRED';

/**
 * What kind of "mode" this place satisfies. Mirrors the home-screen mood
 * buttons 1:1 so the engine's first filter pass is a plain tag match.
 */
export type MoodTag =
  | 'hungry_light'
  | 'hungry_a_lot'
  | 'drink'
  | 'party'
  | 'adrenaline'
  | 'sightseeing'
  | 'shopping'
  | 'coffee_sweet'
  | 'chill';

export type GroupTag = 'couple' | 'friends' | 'family' | 'solo' | 'any';

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

/** "HH:mm" 24h, local Budapest time. `close` past midnight (e.g. club until 05:00) is expressed as e.g. "05:00" and the engine treats it as next-day. */
export interface OpeningHoursRange {
  open: string;
  close: string;
}

export type OpeningHours = Partial<Record<Weekday, OpeningHoursRange[]>>;

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  subcategory?: string;
  description: string;

  location: string;
  coordinates: GeoCoordinates;

  openingHours: OpeningHours;
  priceLevel?: PriceLevel;
  estimatedDurationMinutes: number;
  indoorOutdoor: IndoorOutdoor;

  tags: string[];
  moodTags: MoodTag[];
  /** Energy required to enjoy this place, 1 (very low) – 5 (very high). Used to match against UserState.energyLevel. */
  energyRequired: 1 | 2 | 3 | 4 | 5;
  groupSuitability: GroupTag[];

  requiresBooking: boolean;
  visited: boolean;
  status: PlaceStatus;
  notes?: string;

  image?: string;
  website?: string;
  bookingUrl?: string;
  rating?: number;
}
