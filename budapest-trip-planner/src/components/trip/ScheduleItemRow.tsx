import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type { ScheduleItem, ScheduleItemStatus } from '@/types';
import { usePlacesStore } from '@/store';

const STATUS_DOT: Record<ScheduleItemStatus, string> = {
  confirmed: '🟢',
  suggested: '🟡',
  flexible: '⚪',
  cancelled: '🔴',
};

interface ScheduleItemRowProps {
  item: ScheduleItem;
  onFillFreeTime?: ((item: ScheduleItem) => void) | undefined;
}

export function ScheduleItemRow({ item, onFillFreeTime }: ScheduleItemRowProps): JSX.Element {
  const place = usePlacesStore((s) => (item.placeId ? s.places.find((p) => p.id === item.placeId) : undefined));
  const isFreeTime = item.type === 'free_time';

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-xl2 border border-base-border bg-base-surface px-3 py-3',
        item.status === 'cancelled' && 'opacity-50',
      )}
    >
      <div className="w-12 shrink-0 text-center text-sm font-semibold text-ink-secondary">{item.time}</div>
      <span className="text-lg leading-none">{STATUS_DOT[item.status]}</span>

      <div className="min-w-0 flex-1">
        {place ? (
          <Link to={`/place/${place.id}`} className="block truncate text-sm font-medium text-ink-primary hover:text-accent-gold">
            {item.title}
          </Link>
        ) : (
          <p className="truncate text-sm font-medium text-ink-primary">{item.title}</p>
        )}
        {item.notes && <p className="truncate text-xs text-ink-muted">{item.notes}</p>}
      </div>

      {isFreeTime && onFillFreeTime && (
        <button
          type="button"
          onClick={() => onFillFreeTime(item)}
          className="shrink-0 rounded-full border border-accent-gold/40 px-3 py-1 text-xs font-medium text-accent-gold hover:bg-accent-gold/10"
        >
          מה עושים?
        </button>
      )}
    </div>
  );
}
