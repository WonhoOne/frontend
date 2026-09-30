import { QueryClient } from '@tanstack/react-query';

/**
 * Foundation 단계의 Query 재시도 정책이다.
 *
 * CONTRACT: 정규화된 HTTP/domain error가 아직 없으므로 generic default는
 * 최대 1회 재시도로 제한한다. Resource별 freshness/error 정책은 승인된
 * 계약이 생긴 뒤 각 Feature query가 소유한다.
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
