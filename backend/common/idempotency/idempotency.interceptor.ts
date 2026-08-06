import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { IDEMPOTENCY_HEADER } from '@barber-marketplace/api-contracts';
import { ValidationError } from '@barber-marketplace/errors';
import { type HttpRequestLike } from '../http/http.types';
import { IDEMPOTENCY_STORE, type IdempotencyStore } from './idempotency-store.port';

const WRITE_METHODS: ReadonlySet<string> = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

/** Enforces + serves idempotency on write requests. Replays return the stored response. */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(IDEMPOTENCY_STORE) private readonly store: IdempotencyStore) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<HttpRequestLike>();
    if (!WRITE_METHODS.has(req.method)) return next.handle();

    const raw = req.headers[IDEMPOTENCY_HEADER.toLowerCase()];
    const key = typeof raw === 'string' ? raw : '';
    if (key.length === 0) {
      // Constitution: every write carries an idempotency key.
      throw new ValidationError('idempotency_key_required', 'נדרש מפתח ייחודיות (Idempotency-Key) לבקשה זו.');
    }

    const existing = await this.store.get(key);
    if (existing) return of(existing.body);

    return next.handle().pipe(
      mergeMap(async (body: unknown) => {
        await this.store.put(key, { statusCode: 200, body }, IDEMPOTENCY_TTL_SECONDS);
        return body;
      }),
    );
  }
}
