import { backendOrigin } from '../backend';

const PROBE_PATH = '/health';
const PROBE_TIMEOUT_MS = 3000;

export const dynamic = 'force-dynamic';

interface HealthPayload {
  status: 'up' | 'down';
  backend: string;
  code?: number;
  detail?: string;
}

function answer(payload: HealthPayload, status: number): Response {
  return Response.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}

async function health(): Promise<Response> {
  const backend = backendOrigin();

  let response: Response;
  try {
    response = await fetch(backend + PROBE_PATH, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'unknown error';
    return answer({ status: 'down', backend, detail }, 503);
  }

  if (response.status >= 500) {
    return answer({ status: 'down', backend, code: response.status }, 503);
  }

  return answer({ status: 'up', backend, code: response.status }, 200);
}

export const GET = health;
export const HEAD = health;
