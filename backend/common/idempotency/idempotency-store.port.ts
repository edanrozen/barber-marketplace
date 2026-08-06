/**
 * Port for idempotent write storage. The Redis adapter (real env) MUST implement `reserve`
 * atomically (e.g. SET NX with an in-flight sentinel) — that atomicity, not the interceptor,
 * is what actually prevents double-charge/double-book under concurrent retries.
 */
export interface StoredIdempotentResponse {
  readonly statusCode: number;
  readonly body: unknown;
}

export interface IdempotencyStore {
  /** Return a previously stored response for this key, or null if none. */
  get(key: string): Promise<StoredIdempotentResponse | null>;
  /** Persist the response for future replays. `ttlSeconds` bounds retention. */
  put(key: string, value: StoredIdempotentResponse, ttlSeconds: number): Promise<void>;
}

/** DI token for the store. */
export const IDEMPOTENCY_STORE = Symbol('IDEMPOTENCY_STORE');
