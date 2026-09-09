'use client';

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: true,
      retryDelay: 5000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
