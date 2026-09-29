import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, Phone, Siren } from 'lucide-react';
import clsx from 'clsx';
import { usePlacesStore, useUserStateStore } from '@/store';
import { HOTEL_MIKA } from '@/data/hotel';
import { sortMedicalFacilities } from '@/lib/medicalSort';
import { formatDistance, haversineKm } from '@/lib/distance';
import type { GeoCoordinates, Place } from '@/types';

type MedicalTab = 'emergency' | 'hospitals' | 'clinics' | 'nearest';

const TABS: { id: MedicalTab; label: string }[] = [
  { id: 'emergency', label: '🚑 מיון / חירום' },
  { id: 'hospitals', label: '🏥 בתי חולים' },
  { id: 'clinics', label: '🩺 מרפאות' },
  { id: 'nearest', label: '📍 הכי קרוב אלינו' },
];

function matchesTab(place: Place, tab: MedicalTab): boolean {
  switch (tab) {
    case 'emergency':
      return !!place.emergencyAvailable;
    case 'hospitals':
      return place.medicalFacilityType === 'hospital' || place.medicalFacilityType === 'emergency';
    case 'clinics':
      return place.medicalFacilityType === 'clinic' || place.medicalFacilityType === 'medical_center';
    case 'nearest':
      return true;
  }
}

export function MedicalPage(): JSX.Element {
  const allPlaces = usePlacesStore((s) => s.places);
  const currentLocation = useUserStateStore((s) => s.currentLocation);
  const [tab, setTab] = useState<MedicalTab>('emergency');

  const medicalPlaces = useMemo(() => allPlaces.filter((p) => p.category === 'medical'), [allPlaces]);

  // Hotel Mika is the reference point whenever we have no better fix —
  // never invented, always this verified address/coordinates (Phase 8/9).
  const effectiveLocation = currentLocation ?? HOTEL_MIKA.coordinates;

  const sorted = useMemo(() => {
    const inTab = medicalPlaces.filter((p) => matchesTab(p, tab));
    return sortMedicalFacilities(inTab, effectiveLocation, { emergencyFirst: tab !== 'clinics' });
  }, [medicalPlaces, tab, effectiveLocation]);

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold">צריכים עזרה רפואית?</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {currentLocation ? 'מיון לפי קרבה למיקום שלכם.' : `מיון לפי קרבה למלון (${HOTEL_MIKA.name}), כי אין לנו מיקום חי כרגע.`}
        </p>
      </div>

      <div className="mx-4 flex items-start gap-2 rounded-xl2 border border-accent-rose/40 bg-accent-rose/10 p-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent-rose" />
        <p className="text-xs font-medium leading-relaxed text-accent-rose">
          🚨 במקרה של סכנת חיים או מצב חירום רפואי מיידי — התקשרו לשירותי החירום המקומיים.
        </p>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={clsx(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              tab === id ? 'border-accent-rose bg-accent-rose/10 text-accent-rose' : 'border-base-border text-ink-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-4">
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">אין מקומות בקטגוריה הזו כרגע.</p>
        ) : (
          sorted.map((place) => <MedicalFacilityCard key={place.id} place={place} currentLocation={effectiveLocation} />)
        )}
      </div>
    </div>
  );
}

function MedicalFacilityCard({ place, currentLocation }: { place: Place; currentLocation: GeoCoordinates | null }): JSX.Element {
  const distanceKm = currentLocation && place.coordinates ? haversineKm(currentLocation, place.coordinates) : null;

  return (
    <Link
      to={`/place/${place.id}`}
      className="flex flex-col gap-1.5 rounded-xl2 border border-base-border bg-base-surface p-3 transition-colors hover:border-accent-rose/30"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink-primary">{place.name}</p>
        {place.emergencyAvailable && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-rose/15 px-2 py-0.5 text-[10px] font-bold text-accent-rose">
            <Siren size={11} /> חירום
          </span>
        )}
      </div>
      {place.location && (
        <p className="flex items-center gap-1 text-xs text-ink-secondary">
          <MapPin size={12} />
          {place.location}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        {place.open24Hours && <span className="text-accent-teal">פתוח 24/7</span>}
        {distanceKm !== null && <span>· {formatDistance(distanceKm)}</span>}
        {place.phone && (
          <span className="flex items-center gap-1">
            <Phone size={11} />
            {place.phone}
          </span>
        )}
      </div>
    </Link>
  );
}
