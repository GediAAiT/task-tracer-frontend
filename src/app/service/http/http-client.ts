import type { ErrorResponse } from '@/app/model/task/task';
import { environment } from '@/environments/environment';

export class HttpErrorResponse extends Error {
  readonly status: number;
  readonly error: ErrorResponse | null;

  constructor(status: number, message: string, error: ErrorResponse | null) {
    super(message);
    this.name = 'HttpErrorResponse';
    this.status = status;
    this.error = error;
  }

  get messages(): string[] {
    const message = this.error?.message;
    if (Array.isArray(message)) return message;
    if (typeof message === 'string') return [message];
    return [this.message];
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super(`Could not reach the API at ${environment.apiUrl}. Is the backend running?`);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  query?: QueryParams;
  signal?: AbortSignal;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(environment.apiUrl + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function readErrorBody(response: Response): Promise<ErrorResponse | null> {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as ErrorResponse) : null;
  } catch {
    return null;
  }
}

function describeFailure(response: Response, body: ErrorResponse | null): string {
  const message = body?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return `Request failed with ${response.status} ${response.statusText}`.trim();
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      signal: options.signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new NetworkError(cause);
  }

  if (!response.ok) {
    const parsed = await readErrorBody(response);
    throw new HttpErrorResponse(response.status, describeFailure(response, parsed), parsed);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
