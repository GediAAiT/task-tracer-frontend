import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { NetworkError } from '@/app/service/http/http-client';

const fetchBackendHealth = vi.fn<() => Promise<number>>();
const backendUnreachable = vi.fn();
const backendRecovered = vi.fn();
const success = vi.fn();

vi.mock('@/app/service/health/health.service', () => ({
  fetchBackendHealth: () => fetchBackendHealth(),
}));

vi.mock('@/app/store/task/task.store', () => ({
  taskStoreMethods: {
    backendUnreachable: () => backendUnreachable(),
    backendRecovered: () => backendRecovered(),
  },
}));

vi.mock('@/app/service/notification/notification.service', () => ({
  notify: { success: (...args: unknown[]) => success(...args) },
}));

const { useBackendConnection } = await import('../health.store');

let client: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function offline(): NetworkError {
  return new NetworkError(new TypeError('fetch failed'));
}

beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, refetchInterval: false } },
  });
});

afterEach(() => {
  client.clear();
  vi.clearAllMocks();
});

describe('useBackendConnection', () => {
  it('reports online while the API answers', async () => {
    fetchBackendHealth.mockResolvedValue(200);

    const { result } = renderHook(() => useBackendConnection(), { wrapper });

    await waitFor(() => expect(result.current).toBe('online'));
    expect(backendUnreachable).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it('raises the outage on the store when the probe fails', async () => {
    fetchBackendHealth.mockRejectedValue(offline());

    const { result } = renderHook(() => useBackendConnection(), { wrapper });

    await waitFor(() => expect(result.current).toBe('offline'));
    expect(backendUnreachable).toHaveBeenCalled();
    expect(backendRecovered).not.toHaveBeenCalled();
  });

  it('reloads the tasks and says so once the API answers again', async () => {
    fetchBackendHealth.mockRejectedValue(offline());

    const { result } = renderHook(() => useBackendConnection(), { wrapper });
    await waitFor(() => expect(result.current).toBe('offline'));

    fetchBackendHealth.mockResolvedValue(200);
    await client.refetchQueries();

    await waitFor(() => expect(result.current).toBe('online'));
    expect(backendRecovered).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledWith(
      'Back online',
      'The server answered again and the tasks were reloaded.',
    );
  });

  it('recovers when a successful request marks the API reachable', async () => {
    fetchBackendHealth.mockRejectedValue(offline());

    const { result } = renderHook(() => useBackendConnection(), { wrapper });
    await waitFor(() => expect(result.current).toBe('offline'));

    client.setQueryData(['backend-health'], 200);

    await waitFor(() => expect(result.current).toBe('online'));
    expect(backendRecovered).toHaveBeenCalledTimes(1);
  });

  it('announces the recovery once, not on every later probe', async () => {
    fetchBackendHealth.mockRejectedValue(offline());

    const { result } = renderHook(() => useBackendConnection(), { wrapper });
    await waitFor(() => expect(result.current).toBe('offline'));

    fetchBackendHealth.mockResolvedValue(200);
    await client.refetchQueries();
    await waitFor(() => expect(result.current).toBe('online'));
    await client.refetchQueries();

    expect(success).toHaveBeenCalledTimes(1);
    expect(backendRecovered).toHaveBeenCalledTimes(1);
  });
});
