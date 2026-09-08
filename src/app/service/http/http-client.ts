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
    const target = environment.apiUrl.startsWith('http')
      ? `the API at ${environment.apiUrl}`
      : 'the API';
    super(`Could not reach ${target}. Is the backend running?`);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  query?: QueryParams;
  signal?: AbortSignal;
}

export interface HttpResponse<T> {
  data: T;
  headers: Headers;
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function buildUrl(path: string, query?: QueryParams): string {
  const search = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) search.set(key, String(value));
    }
  }

  const queryString = search.toString();
  return environment.apiUrl + path + (queryString ? `?${queryString}` : '');
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
): Promise<HttpResponse<T>> {
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

  if (response.status === 204) {
    return { data: undefined as T, headers: response.headers };
  }

  const text = await response.text();
  return {
    data: (text ? JSON.parse(text) : undefined) as T,
    headers: response.headers,
  };
}

async function body<T>(
  method: HttpMethod,
  path: string,
  payload: unknown,
  options?: RequestOptions,
): Promise<T> {
  return (await request<T>(method, path, payload, options)).data;
}

export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) => body<T>('GET', path, undefined, options),
  getWithHeaders: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, payload: unknown, options?: RequestOptions) =>
    body<T>('POST', path, payload, options),
  patch: <T>(path: string, payload: unknown, options?: RequestOptions) =>
    body<T>('PATCH', path, payload, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    body<T>('DELETE', path, undefined, options),
};
