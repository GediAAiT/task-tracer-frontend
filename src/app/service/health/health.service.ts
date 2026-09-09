'use client';

import { NetworkError } from '@/app/service/http/http-client';
import { environment } from '@/environments/environment';

const HEALTH_PATH = '/health';
const PROBE_TIMEOUT_MS = 5000;

export async function fetchBackendHealth(): Promise<number> {
  let response: Response;

  try {
    response = await fetch(environment.apiUrl + HEALTH_PATH, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new NetworkError(cause);
  }

  if (response.status >= 500) throw new NetworkError(response.status);

  return response.status;
}
