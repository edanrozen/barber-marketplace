/** Cursor-based pagination — the shared list convention (Constitution §API rules). */
export interface PageRequest {
  readonly cursor?: string;
  readonly limit: number;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/** Clamp a requested limit into the allowed range. */
export const clampLimit = (requested: number): number => {
  if (!Number.isFinite(requested) || requested < 1) return DEFAULT_PAGE_LIMIT;
  return Math.min(Math.trunc(requested), MAX_PAGE_LIMIT);
};
