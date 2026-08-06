/** Typed error taxonomy (Engineering Constitution §Error handling). */
export const ERROR_CATEGORIES = [
  'domain',
  'validation',
  'authorization',
  'not_found',
  'conflict',
  'provider',
  'unexpected',
] as const;
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

/** HTTP status per category. Kept here so transport mapping is single-sourced. */
export const HTTP_STATUS_BY_CATEGORY: Record<ErrorCategory, number> = {
  domain: 422,
  validation: 400,
  authorization: 403,
  not_found: 404,
  conflict: 409,
  provider: 502,
  unexpected: 500,
};
