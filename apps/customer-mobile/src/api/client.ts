import * as Crypto from 'expo-crypto';
import { API_BASE_URL, API_VERSION } from '../config';
import { getAuthBridge, type AuthBridge } from './auth-bridge';

export interface ApiError {
  code: string;
  message: string;
  correlationId?: string;
}
export class ApiRequestError extends Error {
  constructor(public readonly status: number, public readonly apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}
const WRITE_METHODS = new Set(['POST', 'PATCH', 'DELETE']);

async function raw(path: string, opts: RequestOptions, accessToken: string | null): Promise<Response> {
  const method = opts.method ?? 'GET';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Correlation-Id': Crypto.randomUUID(),
  };
  if (WRITE_METHODS.has(method)) headers['Idempotency-Key'] = Crypto.randomUUID();
  if (opts.auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return fetch(`${API_BASE_URL}/${API_VERSION}/${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

/** Performs a request; on a 401 for an authenticated call, transparently refreshes once and retries. */
export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const bridge = getAuthBridge();
  const access = opts.auth && bridge ? bridge.getAccessToken() : null;
  let response = await raw(path, opts, access);

  if (response.status === 401 && opts.auth && bridge) {
    const refreshed = await tryRefresh(bridge);
    if (refreshed) {
      response = await raw(path, opts, bridge.getAccessToken());
    } else {
      bridge.onAuthLost();
    }
  }

  const text = await response.text();
  const json: unknown = text.length > 0 ? JSON.parse(text) : {};
  if (!response.ok) {
    const err = (json as { error?: ApiError }).error ?? { code: 'unknown', message: 'שגיאה' };
    throw new ApiRequestError(response.status, err);
  }
  return json as T;
}

async function tryRefresh(bridge: AuthBridge): Promise<boolean> {
  const refreshToken = bridge.getRefreshToken();
  if (!refreshToken) return false;
  const response = await raw('auth/refresh', { method: 'POST', body: { refreshToken } }, null);
  if (!response.ok) return false;
  const tokens = (await response.json()) as { accessToken: string; refreshToken: string };
  bridge.onTokensRefreshed(tokens.accessToken, tokens.refreshToken);
  return true;
}
