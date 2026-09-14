export type BackendStatus = 'online' | 'offline' | 'checking';

export const BACKEND_HEALTH_KEY = ['backend-health'] as const;

export const BACKEND_OFFLINE_MESSAGE = 'The server is not available, please try again.';

export const HEALTH_POLL_ONLINE_MS = 15_000;
export const HEALTH_POLL_OFFLINE_MS = 5_000;

export function healthPollInterval(offline: boolean): number {
  return offline ? HEALTH_POLL_OFFLINE_MS : HEALTH_POLL_ONLINE_MS;
}
