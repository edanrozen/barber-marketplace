/**
 * The wire shape clients receive for errors. Single source of truth for the client contract.
 * The backend maps the errors-package taxonomy (AppError.toContract) onto this envelope.
 */
export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly recovery?: string;
    readonly correlationId?: string;
  };
}
