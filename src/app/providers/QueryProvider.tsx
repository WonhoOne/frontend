import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { queryClient } from '@/app/providers/queryClient';

/**
 * 전역 TanStack Query runtime 경계를 소유한다.
 *
 * CONTRACT: 이 Provider는 infrastructure만 제공한다. Product query, cache key,
 * stale time, Backend DTO는 각 Feature가 소유한다.
 */
export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
