import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Lock, Pencil } from 'lucide-react';
import type { ScheduleItem, ScheduleItemStatus } from '@/types';
import { usePlacesStore } from '@/store';
import { TYPE_ICON, TYPE_LABEL } from './scheduleItemMeta';

const STATUS_DOT: Record<ScheduleItemStatus, string> = {
  confirmed: '🟢',
  suggested: '🟡',
  flexible: '⚪',
  cancelled: '🔴',
};

interface ScheduleItemRowProps {
  item: ScheduleItem;
  onEdit?: ((item: ScheduleItem) => void) | undefined;
}

export function ScheduleItemRow({ item, onEdit }: ScheduleItemRowProps): JSX.Element {
  const place = usePlacesStore((s) => (item.placeId ? s.places.find((p) => p.id === item.placeId) : undefined));
  const Icon = TYPE_ICON[item.type];

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-xl2 border border-base-border bg-base-surface px-3 py-3',
        item.status === 'cancelled' && 'opacity-50',
      )}
    >
      <div className="w-16 shrink-0 text-center text-xs font-semibold text-ink-secondary">
        <div>{item.startTime}</div>
        <div className="text-ink-muted">{item.endTime}</div>
      </div>

      <span className="text-lg leading-none">{STATUS_DOT[item.status]}</span>
      <Icon size={16} className="shrink-0 text-ink-muted" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {place ? (
            <Link to={`/place/${place.id}`} className="truncate text-sm font-medium text-ink-primary hover:text-accent-gold">
              {item.title}
            </Link>
          ) : (
            <p className="truncate text-sm font-medium text-ink-primary">{item.title}</p>
          )}
          {item.fixed && <Lock size={11} className="shrink-0 text-accent-violet" />}
        </div>
        <p className="truncate text-xs text-ink-muted">
          {TYPE_LABEL[item.type]}
          {item.notes ? ` · ${item.notes}` : ''}
        </p>
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="shrink-0 rounded-full p-1.5 text-ink-muted hover:bg-base-surface2 hover:text-ink-primary"
          aria-label="עריכה"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}
