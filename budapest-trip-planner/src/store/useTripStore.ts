import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScheduleItem, TripDay, TripPlan } from '@/types';
import { TRIP_SEED } from '@/data/trip.seed';
import { makeId } from '@/lib/id';

interface TripState {
  plan: TripPlan;
  currentDayIndex: number;
  currentDay: () => TripDay | undefined;
  setCurrentDayIndex: (index: number) => void;
  addScheduleItem: (dayIndex: number, item: Omit<ScheduleItem, 'id'> & Partial<Pick<ScheduleItem, 'id'>>) => void;
  updateScheduleItem: (dayIndex: number, itemId: string, patch: Partial<ScheduleItem>) => void;
  removeScheduleItem: (dayIndex: number, itemId: string) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      plan: TRIP_SEED,
      currentDayIndex: 0,

      currentDay: () => get().plan.days[get().currentDayIndex],

      setCurrentDayIndex: (index) => set({ currentDayIndex: index }),

      addScheduleItem: (dayIndex, item) => {
        const plan = get().plan;
        const days = plan.days.map((day, idx) => {
          if (idx !== dayIndex) return day;
          const created: ScheduleItem = { ...item, id: item.id ?? makeId('item') };
          return { ...day, schedule: [...day.schedule, created] };
        });
        set({ plan: { ...plan, days } });
      },

      updateScheduleItem: (dayIndex, itemId, patch) => {
        const plan = get().plan;
        const days = plan.days.map((day, idx) => {
          if (idx !== dayIndex) return day;
          return {
            ...day,
            schedule: day.schedule.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
          };
        });
        set({ plan: { ...plan, days } });
      },

      removeScheduleItem: (dayIndex, itemId) => {
        const plan = get().plan;
        const days = plan.days.map((day, idx) => {
          if (idx !== dayIndex) return day;
          return { ...day, schedule: day.schedule.filter((item) => item.id !== itemId) };
        });
        set({ plan: { ...plan, days } });
      },
    }),
    { name: 'budapest-trip-planner:trip' },
  ),
);
