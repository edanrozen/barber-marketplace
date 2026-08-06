import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { AppError, UnexpectedError } from '@barber-marketplace/errors';
import { type ApiErrorResponse, CORRELATION_ID_HEADER } from '@barber-marketplace/api-contracts';
import { type HttpRequestLike, type HttpResponseLike } from '../http/http.types';

/**
 * Global exception filter — maps the typed error taxonomy onto the client error contract.
 * NEVER leaks internals: unknown errors become a generic Hebrew message; full detail is logged
 * server-side only. Correlation id is echoed back for support/tracing.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<HttpRequestLike>();
    const res = ctx.getResponse<HttpResponseLike>();

    const appError = this.toAppError(exception);
    const correlationId = this.readCorrelationId(req);

    this.logger.error(
      `${appError.code}: ${appError.message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const body: ApiErrorResponse = { error: appError.toContract(correlationId) };
    res.status(appError.httpStatus).json(body);
  }

  private toAppError(exception: unknown): AppError {
    if (exception instanceof AppError) return exception;
    // Do not surface framework/provider internals to clients.
    return new UnexpectedError('unexpected_error', 'אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.');
  }

  private readCorrelationId(req: HttpRequestLike): string | undefined {
    const raw = req.headers[CORRELATION_ID_HEADER.toLowerCase()];
    return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
  }
}
