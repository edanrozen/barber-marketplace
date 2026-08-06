import { type INestApplication, VersioningType } from '@nestjs/common';
import { CURRENT_API_VERSION } from '@barber-marketplace/api-contracts';
import { AllExceptionsFilter } from './errors/all-exceptions.filter';

/**
 * Single composition entry-point for cross-cutting HTTP concerns. Called once from main.ts
 * during real-environment integration (one line), so the frozen E1 bootstrap stays untouched now.
 * DI-bound concerns (idempotency interceptor, rate-limit guard, correlation middleware) are
 * registered as APP_INTERCEPTOR/APP_GUARD providers / middleware in the module graph — see README.
 */
export function configureApp(app: INestApplication): void {
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: CURRENT_API_VERSION.replace(/^v/, '') });
  app.useGlobalFilters(new AllExceptionsFilter());
}
