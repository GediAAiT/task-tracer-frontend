import type { NextRequest } from 'next/server';
import { backendOrigin } from '../backend';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
  ...HOP_BY_HOP,
  'content-encoding',
  'content-length',
]);

function requestHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, name) => {
    if (HOP_BY_HOP.has(name) || name === 'host' || name === 'content-length') return;
    headers.set(name, value);
  });
  return headers;
}

function responseHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, name) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(name)) headers.set(name, value);
  });
  return headers;
}

function badGateway(target: string, cause: unknown): Response {
  const detail = cause instanceof Error ? cause.message : 'unknown error';
  console.error(`[api-proxy] ${target} unreachable: ${detail}`);

  return Response.json(
    {
      statusCode: 502,
      message: 'The server is not available, please try again.',
      error: 'Bad Gateway',
    },
    { status: 502 },
  );
}

async function proxy(
  request: NextRequest,
  context: RouteContext<'/api/[...path]'>,
): Promise<Response> {
  const { path } = await context.params;
  const target =
    `${backendOrigin()}/${path.map(encodeURIComponent).join('/')}` + request.nextUrl.search;

  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.arrayBuffer();

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers: requestHeaders(request.headers),
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch (cause) {
    return badGateway(target, cause);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders(response.headers),
  });
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
