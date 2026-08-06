/**
 * Versioned event envelope for the async event backbone. Every event carries a correlation id
 * (traceable end-to-end) and a contract version. Consumers dedup idempotently per (event, user, channel).
 */
export const EVENT_CONTRACT_VERSION = 1;

export interface EventEnvelope<TType extends string, TPayload> {
  readonly eventId: string;
  readonly type: TType;
  readonly version: number;
  readonly occurredAt: string; // ISO-8601 UTC
  readonly correlationId: string;
  readonly payload: TPayload;
}
