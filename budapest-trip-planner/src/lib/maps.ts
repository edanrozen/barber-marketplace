import type { Place } from '@/types';

/**
 * Navigation fallback chain: precise coordinates first, a verified address
 * second, and if we have neither, no link at all — never a bare name-only
 * guess. Shared by every screen that offers a "navigate here" action so a
 * place is either navigable everywhere or nowhere, never inconsistently.
 */
export function mapsUrl(place: Place): string | null {
  const { coordinates, name, location } = place;
  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  }
  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${location}`)}`;
  }
  return null;
}
