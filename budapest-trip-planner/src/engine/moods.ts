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
  { id: 'hungry_light', emoji: '🍔', label: 'רעב קצת', categories: ['food', 'cafe'] },
  { id: 'hungry_a_lot', emoji: '🍕', label: 'רעב ממש', categories: ['food'] },
  { id: 'drink', emoji: '🍸', label: 'רוצה לשתות', categories: ['bar'] },
  { id: 'party', emoji: '🎉', label: 'רוצה מסיבה', categories: ['club', 'bar', 'casino'] },
  { id: 'adrenaline', emoji: '🏎️', label: 'רוצה אדרנלין', categories: ['adrenaline'] },
  { id: 'sightseeing', emoji: '🏛️', label: 'רוצה לטייל', categories: ['attraction'] },
  { id: 'shopping', emoji: '🛍️', label: 'רוצה שופינג', categories: ['shopping'] },
  { id: 'coffee_sweet', emoji: '☕', label: 'רוצה קפה / מתוק', categories: ['cafe'] },
  { id: 'chill', emoji: '😴', label: 'רוצה משהו רגוע', categories: ['attraction', 'cafe', 'water'] },
  { id: 'surprise_me', emoji: '🎲', label: 'תפתיע אותי', categories: [] },
];

export function moodOption(id: string | null): MoodOption | undefined {
  return MOOD_OPTIONS.find((m) => m.id === id);
}
