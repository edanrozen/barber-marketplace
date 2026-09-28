import { CircleCheck } from 'lucide-react';
import type { Place, TripDay } from '@/types';

interface TripProgressProps {
  day: TripDay;
  places: Place[];
}

/** "מה כבר עשינו היום?" — derived purely from actual visited state on places linked to today's schedule, never a separate tracked list of its own. */
export function TripProgress({ day, places }: TripProgressProps): JSX.Element | null {
  const done = day.scheduleItems
    .map((item) => (item.placeId ? places.find((p) => p.id === item.placeId) : undefined))
    .filter((place): place is Place => !!place?.visited);

  if (done.length === 0) return null;

  return (
    <div className="mx-4 rounded-xl2 border border-base-border bg-base-surface p-4">
      <p className="mb-2 text-sm font-semibold text-ink-primary">מה כבר עשינו היום?</p>
      <ul className="flex flex-col gap-1.5">
        {done.map((place) => (
          <li key={place.id} className="flex items-center gap-2 text-sm text-ink-secondary">
            <CircleCheck size={14} className="shrink-0 text-accent-teal" />
            {place.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
