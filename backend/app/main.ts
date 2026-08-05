import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Backend bootstrap (Sprint 1 · T1.1.2).
 * Boots the modular monolith. Intentionally minimal — global pipes, filters,
 * versioning, rate limiting, idempotency and the API planes are added in later
 * Sprint-1 tasks (Epic E4). No business logic here.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
