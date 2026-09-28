import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { usePlacesStore, useTripStore } from '@/store';
import { SCHEDULE_ITEM_TYPES, TYPE_LABEL } from '@/components/trip/scheduleItemMeta';
import { EmptyState } from '@/components/common/EmptyState';
import type { ScheduleItem, ScheduleItemStatus, ScheduleItemType } from '@/types';

const STATUS_OPTIONS: { value: ScheduleItemStatus; label: string }[] = [
  { value: 'confirmed', label: '🟢 Confirmed' },
  { value: 'suggested', label: '🟡 Suggested' },
  { value: 'flexible', label: '⚪ Flexible' },
  { value: 'cancelled', label: '🔴 Cancelled' },
];

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'rounded-lg border border-base-border bg-base-surface2 px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent-gold/50';

export function ScheduleItemEditorPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('day');
  const itemId = searchParams.get('item');

  const plan = useTripStore((s) => s.plan);
  const addScheduleItem = useTripStore((s) => s.addScheduleItem);
  const updateScheduleItem = useTripStore((s) => s.updateScheduleItem);
  const removeScheduleItem = useTripStore((s) => s.removeScheduleItem);
  const places = usePlacesStore((s) => s.places);

  const day = plan.days.find((d) => d.id === dayId);
  const existing = useMemo(
    () => day?.scheduleItems.find((i) => i.id === itemId),
    [day, itemId],
  );

  const [selectedDayId, setSelectedDayId] = useState(dayId ?? plan.days[0]?.id ?? '');
  const [startTime, setStartTime] = useState(existing?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(existing?.endTime ?? '10:00');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [type, setType] = useState<ScheduleItemType>(existing?.type ?? 'OTHER');
  const [placeId, setPlaceId] = useState(existing?.placeId ?? '');
  const [fixed, setFixed] = useState(existing?.fixed ?? false);
  const [status, setStatus] = useState<ScheduleItemStatus>(existing?.status ?? 'flexible');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  if (!dayId || !day) {
    return (
      <EmptyState
        emoji="📅"
        title="לא נבחר יום"
        description="חזרו למסך הטיול שלי ובחרו יום לפני הוספת פעילות."
        action={
          <button type="button" onClick={() => navigate('/today')} className="text-sm font-medium text-accent-gold">
            חזרה לטיול שלי
          </button>
        }
      />
    );
  }

  function handleSave(): void {
    setError(null);
    if (!title.trim()) {
      setError('צריך שם לפעילות.');
      return;
    }
    if (endTime <= startTime) {
      setError('שעת הסיום חייבת להיות אחרי שעת ההתחלה.');
      return;
    }

    const payload: Omit<ScheduleItem, 'id'> = {
      startTime,
      endTime,
      title: title.trim(),
      type,
      status,
      fixed,
      ...(placeId ? { placeId } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    const result = existing
      ? updateScheduleItem(selectedDayId, existing.id, payload)
      : addScheduleItem(selectedDayId, payload);

    if (!result.ok) {
      setError(result.error ?? 'שמירה נכשלה.');
      return;
    }
    navigate('/today');
  }

  function handleDelete(): void {
    if (!existing) return;
    removeScheduleItem(selectedDayId, existing.id);
    navigate('/today');
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <div className="px-4 pt-6">
        <button
          type="button"
          onClick={() => navigate('/today')}
          className="mb-3 flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
        >
          <ArrowRight size={16} />
          חזרה
        </button>
        <h1 className="text-2xl font-extrabold">{existing ? 'עריכת פעילות' : 'הוספת פעילות'}</h1>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {plan.days.length > 1 && (
          <Field label="תאריך">
            <select value={selectedDayId} onChange={(e) => setSelectedDayId(e.target.value)} className={inputClass}>
              {plan.days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title ?? `יום ${d.dayNumber}`} — {d.date}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="שעת התחלה">
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
          </Field>
          <Field label="שעת סיום">
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <Field label="שם הפעילות">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="לדוגמה: ארוחת בוקר"
            className={inputClass}
          />
        </Field>

        <Field label="סוג">
          <select value={type} onChange={(e) => setType(e.target.value as ScheduleItemType)} className={inputClass}>
            {SCHEDULE_ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="מקום מהמאגר (אופציונלי)">
          <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} className={inputClass}>
            <option value="">ללא מקום משויך</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="סטטוס">
          <select value={status} onChange={(e) => setStatus(e.target.value as ScheduleItemStatus)} className={inputClass}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-base-border bg-base-surface2 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-ink-primary">פעילות קבועה (Fixed)</p>
            <p className="text-xs text-ink-muted">אי אפשר להזיז — טיסה, הזמנה, SPARTY וכו׳.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={fixed}
            onClick={() => setFixed((v) => !v)}
            className={clsx('h-6 w-11 shrink-0 rounded-full transition-colors', fixed ? 'bg-accent-violet' : 'bg-base-border')}
          >
            <span
              className={clsx(
                'block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform',
                fixed && '-translate-x-[22px]',
              )}
            />
          </button>
        </div>

        <Field label="הערות (אופציונלי)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
        </Field>

        {error && <p className="rounded-lg bg-accent-rose/10 p-3 text-sm text-accent-rose">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-full bg-accent-gold py-2.5 text-center text-sm font-bold text-base-bg"
          >
            שמירה
          </button>
          {existing && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-full border border-accent-rose/40 px-4 py-2.5 text-sm font-medium text-accent-rose"
            >
              <Trash2 size={14} />
              מחיקה
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
