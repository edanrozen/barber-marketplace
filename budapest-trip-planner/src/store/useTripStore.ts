import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScheduleItem, TripDay, TripPlan } from '@/types';
import { TRIP_SEED } from '@/data/trip.seed';
import { makeId } from '@/lib/id';
import { dateKey, nowMinutes, parseHHMM } from '@/lib/time';

/** Before this hour, we're still plausibly inside "last night" rather than a fresh day — the window every midnight-crossing item in the real itinerary (SPARTY, Ötkert, AETHER, the Casino/La Siesta option) falls into. */
const LATE_NIGHT_CUTOFF_MINUTES = 6 * 60;

export interface ScheduleWriteResult {
  ok: boolean;
  error?: string;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** A real end when given, else a zero-length point in time — enough to check overlap against without reaching into the places store from here. */
function guardEnd(item: ScheduleItem): number {
  return item.endTime ? parseHHMM(item.endTime) : parseHHMM(item.startTime);
}

/** A flexible item may never be saved so that it overlaps an existing fixed item — fixed items can only be moved/removed deliberately, never silently displaced. */
function fixedOverlapError(day: TripDay, candidate: ScheduleItem): string | null {
  if (candidate.fixed) return null;

  const start = parseHHMM(candidate.startTime);
  const end = guardEnd(candidate);

  const blocker = day.scheduleItems.find(
    (item) =>
      item.id !== candidate.id &&
      item.fixed &&
      item.status !== 'cancelled' &&
      overlaps(start, end, parseHHMM(item.startTime), guardEnd(item)),
  );

  return blocker
    ? `הפעילות חופפת לפעילות קבועה: "${blocker.title}" (${blocker.startTime}${blocker.endTime ? `–${blocker.endTime}` : ''}).`
    : null;
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
        const days = get().plan.days;
        const todayDay = days.find((d) => d.date === dateKey(now));

        // Middle of the night: if last night's plan has anything that
        // crosses midnight (startTime >= "24:00"), that's still "today" as
        // far as the live schedule/recommendation context is concerned —
        // storing it under yesterday's array (per its real evening) is
        // exactly what keeps it sorting correctly, but a live "what's
        // next" query still needs to find it there.
        if (nowMinutes(now) < LATE_NIGHT_CUTOFF_MINUTES) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayDay = days.find((d) => d.date === dateKey(yesterday));
          const crossesMidnight = yesterdayDay?.scheduleItems.some(
            (item) => item.status !== 'cancelled' && parseHHMM(item.startTime) >= 1440,
          );
          if (crossesMidnight) return yesterdayDay;
        }

        return todayDay;
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
    // Bumped again: the real 7-day itinerary replaces the empty placeholder
    // day, and persisted state would otherwise shadow it in any browser
    // that already opened the app before this data landed.
    { name: 'budapest-trip-planner:trip-v3' },
  ),
);
