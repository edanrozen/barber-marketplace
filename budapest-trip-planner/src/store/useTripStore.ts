import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScheduleItem, TripDay, TripPlan } from '@/types';
import { TRIP_SEED } from '@/data/trip.seed';
import { makeId } from '@/lib/id';
import { dateKey, parseHHMM } from '@/lib/time';

export interface ScheduleWriteResult {
  ok: boolean;
  error?: string;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** A flexible item may never be saved so that it overlaps an existing fixed item — fixed items can only be moved/removed deliberately, never silently displaced. */
function fixedOverlapError(day: TripDay, candidate: ScheduleItem): string | null {
  if (candidate.fixed) return null;

  const start = parseHHMM(candidate.startTime);
  const end = parseHHMM(candidate.endTime);

  const blocker = day.scheduleItems.find(
    (item) =>
      item.id !== candidate.id &&
      item.fixed &&
      item.status !== 'cancelled' &&
      overlaps(start, end, parseHHMM(item.startTime), parseHHMM(item.endTime)),
  );

  return blocker ? `הפעילות חופפת לפעילות קבועה: "${blocker.title}" (${blocker.startTime}–${blocker.endTime}).` : null;
}

interface TripState {
  plan: TripPlan;
  currentDayIndex: number;
  currentDay: () => TripDay | undefined;
  /** The TripDay whose date matches `now`'s calendar date, if the plan has one — used for live "what's happening right now" queries, independent of whichever day the Today page tabs are browsing. */
  todaysTripDay: (now: Date) => TripDay | undefined;
  setCurrentDayIndex: (index: number) => void;
  addScheduleItem: (
    dayId: string,
    item: Omit<ScheduleItem, 'id'> & Partial<Pick<ScheduleItem, 'id'>>,
  ) => ScheduleWriteResult;
  updateScheduleItem: (dayId: string, itemId: string, patch: Partial<ScheduleItem>) => ScheduleWriteResult;
  removeScheduleItem: (dayId: string, itemId: string) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      plan: TRIP_SEED,
      currentDayIndex: 0,

      currentDay: () => get().plan.days[get().currentDayIndex],

      todaysTripDay: (now) => {
        const key = dateKey(now);
        return get().plan.days.find((d) => d.date === key);
      },

      setCurrentDayIndex: (index) => set({ currentDayIndex: index }),

      addScheduleItem: (dayId, item) => {
        const plan = get().plan;
        const day = plan.days.find((d) => d.id === dayId);
        if (!day) return { ok: false, error: 'היום המבוקש לא נמצא.' };

        const created: ScheduleItem = { ...item, id: item.id ?? makeId('item') };
        const conflict = fixedOverlapError(day, created);
        if (conflict) return { ok: false, error: conflict };

        const days = plan.days.map((d) => (d.id === dayId ? { ...d, scheduleItems: [...d.scheduleItems, created] } : d));
        set({ plan: { ...plan, days } });
        return { ok: true };
      },

      updateScheduleItem: (dayId, itemId, patch) => {
        const plan = get().plan;
        const day = plan.days.find((d) => d.id === dayId);
        if (!day) return { ok: false, error: 'היום המבוקש לא נמצא.' };

        const existing = day.scheduleItems.find((i) => i.id === itemId);
        if (!existing) return { ok: false, error: 'הפעילות לא נמצאה.' };

        const updated: ScheduleItem = { ...existing, ...patch };
        const conflict = fixedOverlapError(day, updated);
        if (conflict) return { ok: false, error: conflict };

        const days = plan.days.map((d) =>
          d.id === dayId
            ? { ...d, scheduleItems: d.scheduleItems.map((i) => (i.id === itemId ? updated : i)) }
            : d,
        );
        set({ plan: { ...plan, days } });
        return { ok: true };
      },

      removeScheduleItem: (dayId, itemId) => {
        const plan = get().plan;
        const days = plan.days.map((d) =>
          d.id === dayId ? { ...d, scheduleItems: d.scheduleItems.filter((i) => i.id !== itemId) } : d,
        );
        set({ plan: { ...plan, days } });
      },
    }),
    { name: 'budapest-trip-planner:trip-v2' },
  ),
);
