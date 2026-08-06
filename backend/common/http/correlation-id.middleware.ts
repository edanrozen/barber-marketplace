import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CORRELATION_ID_HEADER } from '@barber-marketplace/api-contracts';
import { type HttpRequestLike, type HttpResponseLike } from './http.types';

/** Ensures every request carries a correlation id (from the client or freshly minted) for end-to-end tracing. */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: HttpRequestLike, res: HttpResponseLike, next: () => void): void {
    const header = CORRELATION_ID_HEADER.toLowerCase();
    const existing = req.headers[header];
    const id = typeof existing === 'string' && existing.length > 0 ? existing : randomUUID();
    req.headers[header] = id;
    res.setHeader(CORRELATION_ID_HEADER, id);
    next();
  }
}
