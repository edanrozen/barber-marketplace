/**
 * The consistent error contract returned to clients: machine code + human (Hebrew) message
 * + optional recovery hint + correlation id. NEVER leaks internals/stack traces/provider errors.
 * Structurally aligned with api-contracts ApiErrorResponse.error (unified at the composition root).
 */
export interface ErrorContract {
  readonly code: string;
  readonly message: string;
  readonly recovery?: string;
  readonly correlationId?: string;
}
