import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LocateFixed, Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useUserStateStore } from '@/store';
import { getCurrentLocation } from '@/lib/geolocation';
import { LocationStatus } from '@/components/home/LocationStatus';
import type { Level0to3, PriceLevel } from '@/types';

const LEVEL_ITEMS: { value: Level0to3; label: string }[] = [
  { value: 0, label: 'לא' },
  { value: 1, label: 'קצת' },
  { value: 2, label: 'די' },
  { value: 3, label: 'מאוד' },
];
const ENERGY_ITEMS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [1, 2, 3, 4, 5].map((n) => ({
  value: n as 1 | 2 | 3 | 4 | 5,
  label: String(n),
}));
const BUDGET_ITEMS: { value: PriceLevel; label: string }[] = [
  { value: 1, label: '₪' },
  { value: 2, label: '₪₪' },
  { value: 3, label: '₪₪₪' },
  { value: 4, label: '₪₪₪₪' },
];

function LevelPicker<T extends number>({
  value,
  items,
  onChange,
}: {
  value: T;
  items: { value: T; label: string }[];
  onChange: (v: T) => void;
}): JSX.Element {
  return (
    <div className="flex gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={clsx(
            'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
            value === item.value ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' : 'border-base-border text-ink-secondary',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Field({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink-primary">{title}</p>
      {children}
    </div>
  );
}

export function UserStatePage(): JSX.Element {
  const navigate = useNavigate();
  const state = useUserStateStore((s) => s);
  const [locating, setLocating] = useState(false);

  async function useMyLocation(): Promise<void> {
    setLocating(true);
    try {
      const pos = await getCurrentLocation();
      state.set({
        currentLocation: { lat: pos.latitude, lng: pos.longitude },
        currentLocationLabel: null,
        locationSource: 'live',
      });
    } catch {
      // Permission denied or unsupported — leave whatever location (if any) we already had.
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-5 pb-6">
      <div className="px-4 pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
        >
          <ArrowRight size={16} />
          חזרה
        </button>
        <h1 className="text-2xl font-extrabold">המצב שלנו</h1>
        <p className="mt-1 text-sm text-ink-secondary">כל שדה כאן משפיע ישירות על ההמלצה הבאה.</p>
      </div>

      <div className="flex flex-col gap-5 px-4">
        <Field title="🍔 רמת רעב">
          <LevelPicker value={state.hungerLevel} items={LEVEL_ITEMS} onChange={(v) => state.set({ hungerLevel: v })} />
        </Field>

        <Field title="🥤 רמת צמא">
          <LevelPicker value={state.thirstLevel} items={LEVEL_ITEMS} onChange={(v) => state.set({ thirstLevel: v })} />
        </Field>

        <Field title="⚡ רמת אנרגיה">
          <LevelPicker value={state.energyLevel} items={ENERGY_ITEMS} onChange={(v) => state.set({ energyLevel: v })} />
        </Field>

        <Field title="💰 תקציב">
          <LevelPicker value={state.budget} items={BUDGET_ITEMS} onChange={(v) => state.set({ budget: v })} />
        </Field>

        <Field title="👥 כמה אתם">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => state.set({ groupSize: Math.max(1, state.groupSize - 1) })}
              className="rounded-full border border-base-border p-2 text-ink-secondary"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-lg font-semibold">{state.groupSize}</span>
            <button
              type="button"
              onClick={() => state.set({ groupSize: state.groupSize + 1 })}
              className="rounded-full border border-base-border p-2 text-ink-secondary"
            >
              <Plus size={16} />
            </button>
          </div>
        </Field>

        <Field title="📍 מיקום נוכחי">
          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center justify-center gap-2 rounded-full border border-base-border py-2.5 text-sm font-medium text-ink-secondary hover:border-accent-gold/40 hover:text-accent-gold"
          >
            <LocateFixed size={16} />
            {locating ? 'מאתר מיקום...' : state.currentLocation ? 'עדכן מיקום נוכחי' : 'השתמשו במיקום שלי'}
          </button>
          <div className="flex justify-center">
            <LocationStatus source={state.locationSource} />
          </div>
        </Field>
      </div>
    </div>
  );
}
