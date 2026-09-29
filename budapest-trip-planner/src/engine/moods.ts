import type { MoodTag, PlaceCategory } from '@/types';

export interface MoodOption {
  id: MoodTag | 'surprise_me';
  emoji: string;
  label: string;
  /** Categories this mood is willing to consider. Empty = all categories (surprise me). */
  categories: PlaceCategory[];
}

/** Home-screen grid, in display order. Mirrors the brief 1:1. */
export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'hungry_light', emoji: '🍔', label: 'רעבים קצת', categories: ['food', 'cafe'] },
  { id: 'hungry_a_lot', emoji: '🍕', label: 'רעבים ממש', categories: ['food'] },
  { id: 'drink', emoji: '🍸', label: 'בא לנו לשתות', categories: ['bar'] },
  { id: 'party', emoji: '🎉', label: 'בא לנו מסיבה', categories: ['club', 'bar', 'casino'] },
  { id: 'casino', emoji: '🎰', label: 'בא לנו קזינו', categories: ['casino'] },
  { id: 'adrenaline', emoji: '🏎️', label: 'בא לנו אדרנלין', categories: ['adrenaline'] },
  { id: 'sightseeing', emoji: '🏛️', label: 'בא לנו לטייל', categories: ['attraction'] },
  { id: 'shopping', emoji: '🛍️', label: 'בא לנו שופינג', categories: ['shopping'] },
  { id: 'coffee_sweet', emoji: '☕', label: 'קפה / מתוק', categories: ['cafe', 'dessert'] },
  { id: 'dessert', emoji: '🍰', label: 'בא לנו קינוח', categories: ['dessert'] },
  // Category-level match keeps every dessert place a candidate; the engine's
  // moodMatchFactor already gives full points only to places whose moodTags
  // include 'ice_cream' (gelato/ice pops), so those rank first without
  // hard-excluding a kürtőskalács-only shop from ever surfacing here.
  { id: 'ice_cream', emoji: '🍦', label: 'בא לנו גלידה', categories: ['dessert'] },
  { id: 'chill', emoji: '😴', label: 'משהו רגוע', categories: ['attraction', 'cafe', 'water'] },
  { id: 'surprise_me', emoji: '🎲', label: 'תפתיע אותנו', categories: [] },
];

export function moodOption(id: string | null): MoodOption | undefined {
  return MOOD_OPTIONS.find((m) => m.id === id);
}
