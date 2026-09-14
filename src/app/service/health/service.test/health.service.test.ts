import { afterEach, describe, expect, it, vi } from 'vitest';
import { NetworkError } from '@/app/service/http/http-client';
import { fetchBackendHealth } from '../health.service';

function answer(status: number): Response {
  return new Response(null, { status });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchBackendHealth', () => {
  it('resolves with the status the backend answered', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer(200)));

    await expect(fetchBackendHealth()).resolves.toBe(200);
  });

  it('counts a 404 as reachable, since the backend still answered', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer(404)));

    await expect(fetchBackendHealth()).resolves.toBe(404);
  });

  it('rejects when the connection is refused', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(fetchBackendHealth()).rejects.toBeInstanceOf(NetworkError);
  });

  it('rejects when the proxy reports the backend is down', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer(503)));

    await expect(fetchBackendHealth()).rejects.toBeInstanceOf(NetworkError);
  });

  it('asks the API for its health without a cached answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer(200));
    vi.stubGlobal('fetch', fetchMock);

    await fetchBackendHealth();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/health');
    expect(init).toMatchObject({ method: 'GET', cache: 'no-store' });
  });
});
