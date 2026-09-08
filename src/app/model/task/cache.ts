export type CacheStatus = 'HIT' | 'MISS' | 'BYPASS' | 'UNKNOWN';

export interface CacheDiagnostics {
  status: CacheStatus;
  key: string | null;
  ageSeconds: number | null;
  invalidationEnabled: boolean | null;
}

export const CACHE_HEADERS = {
  status: 'X-Cache',
  key: 'X-Cache-Key',
  age: 'X-Cache-Age',
  invalidation: 'X-Cache-Invalidation',
} as const;

const KNOWN_STATUSES: readonly CacheStatus[] = ['HIT', 'MISS', 'BYPASS'];

function toStatus(raw: string | null): CacheStatus {
  if (raw === null) return 'UNKNOWN';
  const upper = raw.trim().toUpperCase() as CacheStatus;
  return KNOWN_STATUSES.includes(upper) ? upper : 'UNKNOWN';
}

function toAge(raw: string | null): number | null {
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

function toInvalidation(raw: string | null): boolean | null {
  if (raw === null) return null;
  return raw.trim().toLowerCase() !== 'disabled';
}

export function readCacheDiagnostics(headers: Headers): CacheDiagnostics {
  return {
    status: toStatus(headers.get(CACHE_HEADERS.status)),
    key: headers.get(CACHE_HEADERS.key),
    ageSeconds: toAge(headers.get(CACHE_HEADERS.age)),
    invalidationEnabled: toInvalidation(headers.get(CACHE_HEADERS.invalidation)),
  };
}

export function isServingStale(cache: CacheDiagnostics): boolean {
  return cache.status === 'HIT' && cache.invalidationEnabled === false;
}
