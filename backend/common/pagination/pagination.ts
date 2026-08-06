import { type Page, type PageRequest, clampLimit } from '@barber-marketplace/api-contracts';

/** Parse untrusted query params into a safe cursor PageRequest. */
export const parsePageRequest = (query: { cursor?: unknown; limit?: unknown }): PageRequest => {
  const rawLimit = typeof query.limit === 'string' ? Number(query.limit) : typeof query.limit === 'number' ? query.limit : Number.NaN;
  const limit = clampLimit(rawLimit);
  return typeof query.cursor === 'string' && query.cursor.length > 0
    ? { cursor: query.cursor, limit }
    : { limit };
};

/** Build a standard page envelope. */
export const buildPage = <T>(items: readonly T[], nextCursor: string | null): Page<T> => ({
  items,
  nextCursor,
  hasMore: nextCursor !== null,
});
