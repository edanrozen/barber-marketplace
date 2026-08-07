/**
 * @barber-marketplace/api-contracts
 * Single source of truth for cross-cutting API contracts shared by clients and backend:
 * versioning, headers (idempotency/correlation), cursor pagination, error-response envelope.
 * Populated in Epic E4 (T4.2.1, T4.3.3). Breaking changes require a new version.
 */
export * from './version';
export * from './headers';
export * from './pagination';
export * from './error-response';
export * from './auth';
export * from './profile';
export * from './professional';
export * from './availability';
export * from './booking';
export * from './notification';
export * from './payment';
