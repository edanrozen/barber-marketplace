import type { GeoCoordinates, LocationSource, Place } from '@/types';

export interface RawGeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Thin wrapper around the browser Geolocation API. Deliberately never
 * called on app load — only from a flow where location actually improves
 * the result (entering the mood-recommendation flow). Rejects instead of
 * hanging forever if permission is denied or the device has no GPS.
 */
export function getCurrentLocation(options?: PositionOptions): Promise<RawGeoPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('geolocation-unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          ...(pos.coords.accuracy !== null ? { accuracy: pos.coords.accuracy } : {}),
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000, ...options },
    );
  });
}

function toGeoCoordinates(pos: RawGeoPosition): GeoCoordinates {
  return { lat: pos.latitude, lng: pos.longitude };
}

export interface ResolvedLocation {
  coordinates: GeoCoordinates | null;
  source: LocationSource;
}

/**
 * The fallback chain the brief asks for: try a fresh GPS fix; if that
 * fails or is denied, reuse the last known fix; if there's never been
 * one, fall back to wherever the current/next scheduled activity's place
 * is (when it has real coordinates); otherwise admit there's nothing.
 * Never throws — always resolves to *some* tier, even 'none'.
 */
export async function resolveCurrentLocation(
  lastKnown: GeoCoordinates | null,
  scheduleFallbackPlace: Place | null,
): Promise<ResolvedLocation> {
  try {
    const live = await getCurrentLocation();
    return { coordinates: toGeoCoordinates(live), source: 'live' };
  } catch {
    if (lastKnown) return { coordinates: lastKnown, source: 'last-known' };
    if (scheduleFallbackPlace?.coordinates) {
      return { coordinates: scheduleFallbackPlace.coordinates, source: 'fallback' };
    }
    return { coordinates: null, source: 'none' };
  }
}
