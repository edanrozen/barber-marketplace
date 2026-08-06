import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthorizationError } from '@barber-marketplace/errors';
import { type HttpRequestLike } from '../http/http.types';

/**
 * Establishes the admin-plane boundary with a DENY-BY-DEFAULT posture. Full RBAC
 * (roles → permissions, step-up MFA) lands in E5; this guard only admits admin-plane roles
 * and denies everything else (including unauthenticated requests, where `user` is absent).
 */
const ADMIN_PLANE_ROLES: ReadonlySet<string> = new Set(['support', 'moderator', 'admin', 'super_admin']);

@Injectable()
export class AdminPlaneGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<HttpRequestLike>();
    const role = req.user?.role;
    if (typeof role === 'string' && ADMIN_PLANE_ROLES.has(role)) return true;
    throw new AuthorizationError('admin_plane_forbidden', 'אין לך הרשאה לבצע פעולה זו.');
  }
}
