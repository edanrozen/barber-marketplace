import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { usePlacesStore, useTripStore, useUserStateStore } from '@/store';
import { DayTimeline } from '@/components/trip/DayTimeline';
import { ScheduleHeader } from '@/components/trip/ScheduleHeader';
import { ConflictWarnings } from '@/components/trip/ConflictWarnings';
import { getNextFixedActivity, detectScheduleConflicts, buildRecommendationContext } from '@/engine/recommendationEngine';
import { getCurrentTime } from '@/lib/time';
import type { ScheduleItem } from '@/types';

export function TodayPage(): JSX.Element {
  const navigate = useNavigate();
  const places = usePlacesStore((s) => s.places);
  const plan = useTripStore((s) => s.plan);
  const currentDayIndex = useTripStore((s) => s.currentDayIndex);
  const setCurrentDayIndex = useTripStore((s) => s.setCurrentDayIndex);
  const todaysTripDay = useTripStore((s) => s.todaysTripDay);
  const userState = useUserStateStore((s) => s);

  const day = plan.days[currentDayIndex];
  const now = useMemo(() => getCurrentTime(), []);

  // Open on the day the trip is actually on today, not always day 1.
  useEffect(() => {
    const real = todaysTripDay(now);
    if (!real) return;
    const idx = plan.days.findIndex((d) => d.id === real.id);
    if (idx >= 0 && idx !== currentDayIndex) setCurrentDayIndex(idx);
  }, []);

  // getNextFixedActivity/buildRecommendationContext already return
  // null/no-countdown on their own when `day` is days away from `now` —
  // nothing extra to gate here.
  const nextActivity = useMemo(
    () => (day ? getNextFixedActivity(day, places, userState, now) : null),
    [day, places, userState, now],
  );

  const availableMinutes = useMemo(() => {
    if (!day) return null;
    return buildRecommendationContext({ places, currentDay: day, userState, mood: null, now }).availableMinutes;
  }, [day, places, userState, now]);

  const conflicts = useMemo(() => (day ? detectScheduleConflicts(day, places) : []), [day, places]);

  function handleEditItem(item: ScheduleItem): void {
    if (!day) return;
    navigate(`/schedule?day=${day.id}&item=${item.id}`);
  }

  function handleAddItem(): void {
    if (!day) return;
    navigate(`/schedule?day=${day.id}`);
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="flex items-center justify-between px-4 pt-6">
        <div>
          <h1 className="text-2xl font-extrabold">מה יש לכם היום?</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {plan.destination} · {day?.title ?? `יום ${day?.dayNumber ?? ''}`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1.5 rounded-full bg-accent-gold px-3 py-2 text-sm font-bold text-base-bg"
        >
          <Plus size={16} />
          הוספה
        </button>
      </div>

      {plan.days.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {plan.days.map((d, idx) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setCurrentDayIndex(idx)}
              className={clsx(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                idx === currentDayIndex
                  ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                  : 'border-base-border text-ink-secondary',
              )}
            >
              {d.title ?? `יום ${d.dayNumber}`}
            </button>
          ))}
        </div>
      )}

      {day && <ScheduleHeader availableMinutes={availableMinutes} nextActivity={nextActivity} />}
      <ConflictWarnings conflicts={conflicts} />

      {day && (
        <DayTimeline day={day} places={places} onEditItem={handleEditItem} onTapFreeTime={() => navigate('/')} />
      )}
    </div>
  );
}
