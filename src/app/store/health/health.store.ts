'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BACKEND_HEALTH_KEY,
  healthPollInterval,
  type BackendStatus,
} from '@/app/model/health/health';
import { fetchBackendHealth } from '@/app/service/health/health.service';
import { notify } from '@/app/service/notification/notification.service';
import { taskStoreMethods } from '@/app/store/task/task.store';

export function useBackendConnection(): BackendStatus {
  const { isError, isFetching } = useQuery({
    queryKey: BACKEND_HEALTH_KEY,
    queryFn: fetchBackendHealth,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: (query) => healthPollInterval(query.state.status === 'error'),
  });

  const wasOffline = useRef(false);

  useEffect(() => {
    if (isError) {
      wasOffline.current = true;
      taskStoreMethods.backendUnreachable();
      return;
    }

    if (!wasOffline.current) return;
    wasOffline.current = false;

    void taskStoreMethods.backendRecovered();
    notify.success('Back online', 'The server answered again and the tasks were reloaded.');
  }, [isError]);

  if (!isError) return 'online';
  return isFetching ? 'checking' : 'offline';
}
