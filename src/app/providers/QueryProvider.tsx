import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { queryClient } from '@/app/providers/queryClient';

/**
 * Owns the global TanStack Query runtime boundary.
 *
 * CONTRACT: This provider supplies infrastructure only. Product queries,
 * cache keys, stale times, and Backend DTOs remain feature-owned.
 */
export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
