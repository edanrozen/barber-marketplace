import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthorizationError } from '@barber-marketplace/errors';
import { verifyHs256 } from '../domain/jwt';
import { AUTH_CONFIG, type AuthConfig } from '../ports/ports';

interface AuthedRequest { headers: Record<string, string | string[] | undefined>; user?: { id: string; role: string }; }

/** Authenticates a Bearer access token and attaches req.user. Deny-by-default. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers['authorization'];
    const value = typeof header === 'string' ? header : '';
    const token = value.startsWith('Bearer ') ? value.slice('Bearer '.length) : '';
    const verified = verifyHs256(token, this.config.jwtSecret, Math.floor(Date.now() / 1000));
    if (!verified.ok) throw new AuthorizationError('unauthenticated', 'נדרשת התחברות כדי לגשת למשאב זה.');
    req.user = { id: verified.payload.sub, role: verified.payload.role };
    return true;
  }
}
