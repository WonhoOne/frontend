import type { QueryClient } from '@tanstack/react-query';

export const PRIVATE_QUERY_META_KEY = 'private';

/**
 * Removes only server state explicitly classified as private.
 *
 * SECURITY: public discovery caches and ReservationDraft are intentionally
 * outside this predicate. Customer features must mark private queries with
 * meta.privacy = PRIVATE_QUERY_META_KEY.
 */
export function clearPrivateQueryCache(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => query.meta?.privacy === PRIVATE_QUERY_META_KEY,
  });
}
