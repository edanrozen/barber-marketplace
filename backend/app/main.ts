import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from '../common';

/**
 * Backend bootstrap. Boots the modular monolith and activates the E4 cross-cutting HTTP
 * layer: URI API versioning + the global error-contract filter. Idempotency + rate-limit
 * remain gated on their stores (Redis / throttler) and are registered in the real environment.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
