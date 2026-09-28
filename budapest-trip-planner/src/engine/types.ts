import type { MoodTag, UserState } from '@/types';

export interface EngineContext {
  userState: UserState;
  mood: MoodTag | 'surprise_me' | null;
  now: Date;
  /** Minutes free before the next fixed commitment. null = rest of the day is open. */
  timeAvailableMinutes: number | null;
  nextActivityTitle: string | null;
  /** Place ids to skip — used for "give me another option". */
  excludeIds: string[];
}

/** A comfortable margin so we don't recommend something that eats every last minute before the next commitment. */
export const TIME_BUFFER_MINUTES = 15;

/** Nothing gets recommended if just getting there costs more than this, regardless of how much free time there is. */
export const MAX_REASONABLE_TRAVEL_MINUTES = 40;
