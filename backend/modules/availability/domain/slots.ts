/** Pure slot computation (no framework/db/tz). Minutes are measured from local midnight. */
export interface WorkingWindow {
  readonly startMinutes: number;
  readonly endMinutes: number;
}
export interface DaySlotInput {
  readonly windows: readonly WorkingWindow[];
  readonly serviceDurationMinutes: number;
  readonly slotStepMinutes: number;
  /** Exclude starts before this (used to drop past/too-soon slots on "today"). */
  readonly earliestStartMinutes: number;
}

/** Start minutes where a service of `serviceDurationMinutes` fits fully inside a working window. */
export const computeDaySlotStarts = (input: DaySlotInput): number[] => {
  const dur = input.serviceDurationMinutes;
  const step = input.slotStepMinutes;
  if (dur <= 0 || step <= 0) return [];
  const starts: number[] = [];
  for (const w of input.windows) {
    const from = Math.max(w.startMinutes, input.earliestStartMinutes);
    let s = Math.ceil(from / step) * step;
    if (s < w.startMinutes) s = w.startMinutes;
    for (; s + dur <= w.endMinutes; s += step) {
      if (s >= input.earliestStartMinutes) starts.push(s);
    }
  }
  return Array.from(new Set(starts)).sort((a, b) => a - b);
};

/** Minutes-from-midnight → 'HH:mm'. */
export const minutesToHHmm = (m: number): string => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h < 10 ? `0${h}` : `${h}`}:${min < 10 ? `0${min}` : `${min}`}`;
};
