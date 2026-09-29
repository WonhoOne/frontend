import { QueryClient } from '@tanstack/react-query';

/**
 * Foundation query retry policy.
 *
 * CONTRACT: Normalized HTTP/domain errors do not exist yet. One retry is the
 * maximum safe generic default; resource-specific freshness and error policy
 * belong to Feature queries once their approved contracts exist.
 */
function shouldRetryQuery(failureCount: number) {
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
