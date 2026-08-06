/** Minimal transport shapes so the cross-cutting layer avoids `any` before framework types resolve. */
export type HeaderValue = string | string[] | undefined;
export interface HeaderBag { [key: string]: HeaderValue; }

export interface HttpRequestLike {
  method: string;
  headers: HeaderBag;
  /** Populated by the auth layer (E5). Absent until authenticated. */
  user?: { role?: string };
}

export interface HttpResponseLike {
  statusCode?: number;
  status(code: number): HttpResponseLike;
  json(body: unknown): unknown;
  setHeader(name: string, value: string): void;
}
