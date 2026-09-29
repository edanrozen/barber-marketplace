import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import type { Place, TripDay } from '@/types';
import { useTripStore } from '@/store';

interface TripProgressProps {
  day: TripDay;
  places: Place[];
}

/** "מה כבר עשינו היום?" + a real day-X-of-N progress bar for the whole trip (Phase 6b). */
export function TripProgress({ day, places }: TripProgressProps): JSX.Element | null {
  const plan = useTripStore((s) => s.plan);
  const totalDays = plan.days.length;

  const done = day.scheduleItems
    .map((item) => (item.placeId ? places.find((p) => p.id === item.placeId) : undefined))
    .filter((place): place is Place => !!place?.visited);

  const progressPercent = totalDays > 0 ? (day.dayNumber / totalDays) * 100 : 0;

  return (
    <div className="mx-4 flex flex-col gap-3 rounded-xl2 border border-base-border bg-base-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink-primary">
          DAY {day.dayNumber} / {totalDays}
        </p>
        <p className="text-xs text-ink-muted">{plan.destination} 🇭🇺</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-base-surface2">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-accent-gold to-accent-violet"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {done.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {done.map((place) => (
            <li key={place.id} className="flex items-center gap-2 text-sm text-ink-secondary">
              <CircleCheck size={14} className="shrink-0 text-accent-teal" />
              {place.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
