import { createHmac, timingSafeEqual } from 'node:crypto';

/** Minimal, dependency-free HS256 JWT (access tokens). Stateless verification. */
const toB64Url = (buf: Buffer): string => buf.toString('base64url');
const encodeJson = (obj: unknown): string => toB64Url(Buffer.from(JSON.stringify(obj)));

export interface JwtPayload {
  readonly sub: string;
  readonly role: string;
  readonly iat: number;
  readonly exp: number;
}

export const signHs256 = (payload: JwtPayload, secret: string): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const signingInput = `${encodeJson(header)}.${encodeJson(payload)}`;
  const sig = toB64Url(createHmac('sha256', secret).update(signingInput).digest());
  return `${signingInput}.${sig}`;
};

export type JwtVerify =
  | { readonly ok: true; readonly payload: JwtPayload }
  | { readonly ok: false; readonly reason: 'malformed' | 'bad_signature' | 'expired' };

export const verifyHs256 = (token: string, secret: string, nowSeconds: number): JwtVerify => {
  const parts = token.split('.');
  const h = parts[0];
  const p = parts[1];
  const s = parts[2];
  if (parts.length !== 3 || h === undefined || p === undefined || s === undefined) {
    return { ok: false, reason: 'malformed' };
  }
  const expected = createHmac('sha256', secret).update(`${h}.${p}`).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(s, 'base64url');
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, reason: 'bad_signature' };
  }
  let payload: JwtPayload;
  try {
    payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')) as JwtPayload;
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSeconds) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true, payload };
};
