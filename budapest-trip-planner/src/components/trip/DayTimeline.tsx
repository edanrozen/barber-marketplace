import type { Place, ScheduleItem, TripDay } from '@/types';
import { computeFreeTimeBlocks, type FreeTimeBlock } from '@/engine/recommendationEngine';
import { sortedItems } from '@/lib/tripSchedule';
import { parseHHMM, nowMinutes, getCurrentTime } from '@/lib/time';
import { EmptyState } from '@/components/common/EmptyState';
import { ScheduleItemRow } from './ScheduleItemRow';
import { FreeTimeBlockRow } from './FreeTimeBlockRow';

interface DayTimelineProps {
  day: TripDay;
  places: Place[];
  onEditItem?: ((item: ScheduleItem) => void) | undefined;
  onTapFreeTime?: (() => void) | undefined;
}

type TimelineEntry =
  | { kind: 'item'; sortMinutes: number; item: ScheduleItem }
  | { kind: 'free'; sortMinutes: number; block: FreeTimeBlock };

function itemEffectiveEnd(item: ScheduleItem, places: Place[]): number {
  if (item.endTime) return parseHHMM(item.endTime);
  const place = item.placeId ? places.find((p) => p.id === item.placeId) : undefined;
  return parseHHMM(item.startTime) + (place?.estimatedDurationMinutes ?? 60);
}

export function DayTimeline({ day, places, onEditItem, onTapFreeTime }: DayTimelineProps): JSX.Element {
  const items = sortedItems(day).filter((item) => item.status !== 'cancelled' || item.fixed);
  const freeBlocks = computeFreeTimeBlocks(day, places);
  const currentMinutes = nowMinutes(getCurrentTime());

  const entries: TimelineEntry[] = [
    ...items.map((item): TimelineEntry => ({ kind: 'item', sortMinutes: parseHHMM(item.startTime), item })),
    ...freeBlocks.map((block): TimelineEntry => ({ kind: 'free', sortMinutes: block.rawStartMinutes, block })),
  ].sort((a, b) => a.sortMinutes - b.sortMinutes);

  if (entries.length === 0) {
    return (
      <EmptyState
        emoji="📅"
        title="עדיין אין לו״ז ליום הזה"
        description="הוסיפו פעילויות קבועות (טיסה, הזמנה, SPARTY...) והזמן הפנוי ביניהן יחושב אוטומטית."
      />
    );
  }

  return (
    <div className="relative flex flex-col gap-2 px-4">
      {/* Connecting line down the time-label column (RTL: right side). */}
      <div className="pointer-events-none absolute bottom-3 right-[38px] top-3 w-px bg-base-border" />
      {entries.map((entry) => {
        const isCurrent =
          entry.kind === 'item' &&
          entry.sortMinutes <= currentMinutes &&
          currentMinutes < itemEffectiveEnd(entry.item, places);
        return entry.kind === 'item' ? (
          <ScheduleItemRow key={entry.item.id} item={entry.item} onEdit={onEditItem} isCurrent={isCurrent} />
        ) : (
          <FreeTimeBlockRow key={entry.block.id} block={entry.block} onTap={() => onTapFreeTime?.()} />
        );
      })}
    </div>
  );
}
