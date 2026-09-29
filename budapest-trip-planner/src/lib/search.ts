import type { Place } from '@/types';
import { CATEGORY_LABELS } from '@/components/common/CategoryIcon';
import { MOOD_OPTIONS } from '@/engine/moods';

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Human-readable mood labels a place qualifies for (e.g. "בא לנו מסיבה" for
 * a casino/bar), so a mood-shaped query finds it without adding an
 * `aliases` field to Place — moodTags + MOOD_OPTIONS already carry this.
 */
function moodLabelsFor(place: Place): string[] {
  const labels: string[] = [];
  for (const option of MOOD_OPTIONS) {
    if (option.id === 'surprise_me') continue;
    if (place.moodTags.includes(option.id)) labels.push(option.label);
  }
  return labels;
}

/**
 * Real-time catalog search over the same Place[] the store already holds —
 * no parallel list, no schema change. Case-insensitive, partial-match,
 * relevance-ranked: exact/prefix/substring name hits outrank a category or
 * description hit, so "trop" ranks Tropicana above any place that merely
 * mentions "tropical" in its description.
 */
export function searchPlaces(places: Place[], rawQuery: string): Place[] {
  const query = norm(rawQuery);
  if (!query) return [];

  const scored: { place: Place; score: number }[] = [];

  for (const place of places) {
    const name = norm(place.name);
    const category = norm(CATEGORY_LABELS[place.category]);
    const subcategory = place.subcategory ? norm(place.subcategory) : '';
    const description = norm(place.description);
    const tags = place.tags.map(norm);
    const moodLabels = moodLabelsFor(place).map(norm);

    let score = 0;
    if (name === query) score = Math.max(score, 100);
    else if (name.startsWith(query)) score = Math.max(score, 90);
    else if (name.includes(query)) score = Math.max(score, 75);

    if (category.includes(query) || subcategory.includes(query)) score = Math.max(score, 55);
    if (tags.some((t) => t.includes(query))) score = Math.max(score, 45);
    if (moodLabels.some((m) => m.includes(query))) score = Math.max(score, 40);
    if (description.includes(query)) score = Math.max(score, 30);

    if (score > 0) scored.push({ place, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name))
    .map((m) => m.place);
}
