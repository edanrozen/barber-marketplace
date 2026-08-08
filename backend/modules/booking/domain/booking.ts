/** Pure booking policy (unit-tested). */
export const CANCELLABLE_STATUSES: ReadonlySet<string> = new Set(['confirmed']);
export const canCancel = (status: string): boolean => CANCELLABLE_STATUSES.has(status);
