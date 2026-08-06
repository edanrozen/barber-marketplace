import { type ErrorCategory, HTTP_STATUS_BY_CATEGORY } from './categories';
import { type ErrorContract } from './contract';

/** Base of the typed error taxonomy. Message is the client-safe (Hebrew) message. */
export abstract class AppError extends Error {
  abstract readonly category: ErrorCategory;
  readonly code: string;
  readonly recovery: string | undefined;

  constructor(code: string, message: string, recovery?: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.recovery = recovery;
  }

  get httpStatus(): number {
    return HTTP_STATUS_BY_CATEGORY[this.category];
  }

  /** Serialize to the client-facing contract. Only safe fields are included. */
  toContract(correlationId?: string): ErrorContract {
    return {
      code: this.code,
      message: this.message,
      ...(this.recovery !== undefined ? { recovery: this.recovery } : {}),
      ...(correlationId !== undefined ? { correlationId } : {}),
    };
  }
}

export class DomainError extends AppError {
  readonly category = 'domain' as const;
}
export class ValidationError extends AppError {
  readonly category = 'validation' as const;
}
export class AuthorizationError extends AppError {
  readonly category = 'authorization' as const;
}
export class NotFoundError extends AppError {
  readonly category = 'not_found' as const;
}
export class ConflictError extends AppError {
  readonly category = 'conflict' as const;
}
export class ProviderError extends AppError {
  readonly category = 'provider' as const;
}
export class UnexpectedError extends AppError {
  readonly category = 'unexpected' as const;
}
