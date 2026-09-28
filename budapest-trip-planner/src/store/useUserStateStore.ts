import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_USER_STATE, type UserState } from '@/types';

interface UserStateStore extends UserState {
  set: (patch: Partial<UserState>) => void;
  reset: () => void;
}

export const useUserStateStore = create<UserStateStore>()(
  persist(
    (set) => ({
      ...DEFAULT_USER_STATE,
      set: (patch) => set(patch),
      reset: () => set(DEFAULT_USER_STATE),
    }),
    { name: 'budapest-trip-planner:user-state' },
  ),
);
