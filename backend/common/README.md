# backend/common — cross-cutting HTTP layer (Epic E4)

Shared, framework-level concerns applied across all modules: **public vs admin plane separation**, **idempotency**, the **error contract**, **pagination**, **API versioning**, **correlation IDs**, and the **rate-limit baseline**. Business rules never live here.

## Plane separation (public vs admin)
Two isolated planes (blueprint §API Layer): the **public** client plane and the **internal admin** plane. Admin controllers sit behind `AdminPlaneGuard` (**deny-by-default**; admits only support/moderator/admin/super_admin) and are audited (audit module = E8) and role-scoped (full RBAC = E5). The planes are separately scalable and never share routes.

## Components
- `configure-app.ts` — `configureApp(app)`: URI API versioning + global exception filter.
- `errors/all-exceptions.filter.ts` — maps the errors-taxonomy → client error contract; never leaks internals; echoes correlation id.
- `http/correlation-id.middleware.ts` — assigns/propagates a correlation id per request.
- `idempotency/` — `IdempotencyInterceptor` + `IdempotencyStore` port.
- `pagination/pagination.ts` — cursor `PageRequest` parsing + `Page<T>` building.
- `planes/admin-plane.guard.ts` — deny-by-default admin boundary.
- `rate-limit/rate-limit.config.ts` — tiered limits (auth/payment/write strictest).

## Idempotency — where the real guarantee lives
The interceptor enforces the `Idempotency-Key` header on writes and serves stored replays, but the **actual** double-charge/double-book guarantee is the store's **atomic reservation** (Redis adapter: `SET NX` + in-flight sentinel), implemented in the real environment. The `IdempotencyStore` port defines that contract.

## Integration touch-points (deferred to keep E1 frozen — apply in the real environment)
1. **`backend/app/main.ts`** — add one line: `configureApp(app);` (E1 explicitly deferred API concerns to E4).
2. **`backend/app/app.module.ts`** — register `APP_INTERCEPTOR → IdempotencyInterceptor`, the rate-limit `APP_GUARD`/`ThrottlerModule`, bind `CorrelationIdMiddleware`, and provide `IDEMPOTENCY_STORE` (Redis adapter).
3. **`backend/tsconfig.json`** — add `"common/**/*.ts"` to `include`.

## Verification status (honest)
- Contract packages (`domain/api/event-contracts`, `errors`): **typecheck CLEAN** offline (pure TS).
- This layer: **syntax-checked** offline; all remaining errors are missing framework/package deps that resolve on `npm install`. **Not runnable here.**
- DoD tests — idempotent replay, standard error contract under fault — are **real-environment** (require running Nest + Redis).

## Minor documented debt
`errors.ErrorContract` and `api-contracts.ApiErrorResponse.error` are intentionally structurally aligned but declared separately (so each package typechecks independently offline). Unify at the composition root during integration.
