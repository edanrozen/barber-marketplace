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
  | 'water'
  | 'casino'
  | 'medical';

/**
 * `medical` places are structurally different from every other category:
 * they must NEVER be scored or suggested by the mood-recommendation engine
 * (see `engine/filters.ts`'s hard category exclusion) and never appear in
 * the general Catalog — they only surface through the dedicated Medical
 * screen (`pages/MedicalPage.tsx`). This is a safety requirement, not a UX
 * preference.
 */
export type MedicalFacilityType = 'hospital' | 'emergency' | 'medical_center' | 'clinic';

export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';

/** 1 = ₪, 4 = ₪₪₪₪. Matches UserState.budget so they compare directly. */
export type PriceLevel = 1 | 2 | 3 | 4;

/**
 * Lifecycle status of a place for *this* trip. AVAILABLE is the only status
 * the recommendation engine will surface unprompted — everything else is
 * either finished, explicitly rejected, or needs a human step first.
 *
 * NEEDS_VERIFICATION: we have a specific reason to doubt the place is open/
 * usable as planned (e.g. reports it's closed or under renovation) and it
 * must not be recommended as a safe, open option until someone confirms it.
 *
 * CONFIRMED: this isn't a spontaneous option at all — it's a locked-in
 * itinerary commitment (has a fixed date/time), so the engine shouldn't
 * suggest it as an alternative the way it would an AVAILABLE place.
 */
export type PlaceStatus =
  | 'AVAILABLE'
  | 'DONE'
  | 'SKIPPED'
  | 'NOT_RELEVANT'
  | 'CLOSED'
  | 'BOOKING_REQUIRED'
  | 'NEEDS_VERIFICATION'
  | 'CONFIRMED';

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

/** 0 (not hungry) – 3 (starving). Mirrors UserState's hunger scale so they compare directly. */
export type HungerFitLevel = 0 | 1 | 2 | 3;

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  subcategory?: string;
  description: string;

  /** Address/area text. Omitted when we don't have a verified address yet — never guessed. */
  location?: string;
  /** Omitted when real GPS coordinates aren't known yet — the engine treats a place without them as reachable-unknown rather than excluding it. */
  coordinates?: GeoCoordinates;

  openingHours: OpeningHours;
  priceLevel?: PriceLevel;
  estimatedDurationMinutes: number;
  /** Omitted when unknown — never guessed for a specific real venue. */
  indoorOutdoor?: IndoorOutdoor;

  tags: string[];
  moodTags: MoodTag[];
  /** Energy required to enjoy this place, 1 (very low) – 5 (very high). Used to match against UserState.energyLevel. */
  energyRequired: 1 | 2 | 3 | 4 | 5;
  /** How hungry someone should be for this to be the right call — lets the engine tell a dessert stop from a steakhouse within the same `food`/`cafe` category. Omitted when we don't have a real signal for it. */
  hungerFit?: HungerFitLevel;
  groupSuitability: GroupTag[];

  requiresBooking: boolean;
  visited: boolean;
  status: PlaceStatus;
  notes?: string;

  image?: string;
  website?: string;
  bookingUrl?: string;
  rating?: number;

  /** Only meaningful when `category === 'medical'`. Omitted fields mean "not verified", never "no"/"false" by default. */
  medicalFacilityType?: MedicalFacilityType;
  emergencyAvailable?: boolean;
  open24Hours?: boolean;
  acceptsTourists?: boolean;
  phone?: string;
}
