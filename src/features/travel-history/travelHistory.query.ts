import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { TravelHistoryDataSource } from '@/features/travel-history/TravelHistoryDataSource';
import type { TravelHistoryItemModel } from '@/features/travel-history/travelHistory.model';

export const travelHistoryQueryKey = ['customer', 'travel-history'] as const;

export function travelHistoryQueryOptions(dataSource: TravelHistoryDataSource) {
  return queryOptions({
    queryKey: travelHistoryQueryKey,
    queryFn: () => dataSource.getTravelHistory(),
    meta: { privacy: 'private' },
    placeholderData: keepPreviousData,
  });
}

/**
 * S10 Previous Trips and S11 My Trips must consume this same hook/options
 * boundary instead of defining screen-local history queries.
 */
export function useTravelHistory(
  dataSource: TravelHistoryDataSource,
): UseQueryResult<readonly TravelHistoryItemModel[], Error> {
  return useQuery(travelHistoryQueryOptions(dataSource));
}
