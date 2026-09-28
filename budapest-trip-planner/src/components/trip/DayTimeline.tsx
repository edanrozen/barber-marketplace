import type { ScheduleItem, TripDay } from '@/types';
import { sortedSchedule } from '@/lib/tripSchedule';
import { EmptyState } from '@/components/common/EmptyState';
import { ScheduleItemRow } from './ScheduleItemRow';

interface DayTimelineProps {
  day: TripDay;
  onFillFreeTime?: ((item: ScheduleItem) => void) | undefined;
}

export function DayTimeline({ day, onFillFreeTime }: DayTimelineProps): JSX.Element {
  const items = sortedSchedule(day);

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="📅"
        title="עדיין אין לו״ז ליום הזה"
        description="כשתזינו את התוכניות והזמנים של היום, הם יופיעו כאן — ובזמנים הפנויים המנוע יוכל להמליץ לכם."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {items.map((item) => (
        <ScheduleItemRow key={item.id} item={item} onFillFreeTime={onFillFreeTime} />
      ))}
    </div>
  );
}
