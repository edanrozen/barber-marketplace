import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useTripStore } from '@/store';
import { DayTimeline } from '@/components/trip/DayTimeline';

export function TodayPage(): JSX.Element {
  const navigate = useNavigate();
  const plan = useTripStore((s) => s.plan);
  const currentDayIndex = useTripStore((s) => s.currentDayIndex);
  const setCurrentDayIndex = useTripStore((s) => s.setCurrentDayIndex);

  const day = plan.days[currentDayIndex];

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold">📅 הטיול שלי</h1>
        <p className="mt-1 text-sm text-ink-secondary">{plan.destination}</p>
      </div>

      {plan.days.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {plan.days.map((d, idx) => (
            <button
              key={d.date}
              type="button"
              onClick={() => setCurrentDayIndex(idx)}
              className={clsx(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                idx === currentDayIndex
                  ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                  : 'border-base-border text-ink-secondary',
              )}
            >
              יום {d.dayNumber}
            </button>
          ))}
        </div>
      )}

      {day && <DayTimeline day={day} onFillFreeTime={() => navigate('/')} />}
    </div>
  );
}
