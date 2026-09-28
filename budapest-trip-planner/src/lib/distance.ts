import type { GeoCoordinates } from '@/types';

const EARTH_RADIUS_KM = 6371;
const AVG_WALK_KMH = 4.5;

export function haversineKm(a: GeoCoordinates, b: GeoCoordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Rough walking ETA. Good enough for ranking; not a routing engine. */
export function estimateWalkMinutes(distanceKm: number): number {
  return Math.round((distanceKm / AVG_WALK_KMH) * 60);
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} מ׳`;
  return `${distanceKm.toFixed(1)} ק"מ`;
}
