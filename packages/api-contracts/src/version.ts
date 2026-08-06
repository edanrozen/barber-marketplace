/** Semantic API versioning. Backward-compatible changes preferred; never hard-break a live mobile client. */
export const API_VERSIONS = ['v1'] as const;
export type ApiVersion = (typeof API_VERSIONS)[number];
export const CURRENT_API_VERSION: ApiVersion = 'v1';
