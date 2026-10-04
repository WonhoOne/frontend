import { queryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { TourDiscoveryDataSource } from '@/features/tour-discovery/TourDiscoveryDataSource';
import { TourProductPresentationError } from '@/features/tour-discovery/tourProduct.adapter';
import type {
  TourDiscoveryCollectionErrorReason,
  TourDiscoveryCollectionState,
  TourProductSummaryModel,
} from '@/features/tour-discovery/tourDiscovery.model';
import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';

export const tourDiscoveryQueryKey = ['public', 'tour-products'] as const;

export function classifyTourDiscoveryError(error: unknown): TourDiscoveryCollectionErrorReason {
  if (error instanceof BackendNetworkError || error instanceof BackendRequestAbortedError) {
    return 'network';
  }

  if (
    error instanceof ContractMappingError ||
    error instanceof BackendMalformedResponseError ||
    error instanceof TourProductPresentationError
  ) {
    return 'data-mismatch';
  }

  return 'server';
}

export function shouldRetryTourDiscovery(failureCount: number, error: unknown) {
  if (
    error instanceof ContractMappingError ||
    error instanceof BackendMalformedResponseError ||
    error instanceof BackendRequestAbortedError ||
    error instanceof TourProductPresentationError
  ) {
    return false;
  }

  if (error instanceof BackendHttpError && error.response.status < 500) {
    return false;
  }

  return failureCount < 1;
}

export function tourDiscoveryQueryOptions(dataSource: TourDiscoveryDataSource) {
  return queryOptions({
    queryKey: tourDiscoveryQueryKey,
    queryFn: ({ signal }) => dataSource.getTourProducts({ signal }),
    retry: shouldRetryTourDiscovery,
  });
}

export function useTourDiscovery(
  dataSource: TourDiscoveryDataSource,
): UseQueryResult<readonly TourProductSummaryModel[], Error> {
  return useQuery(tourDiscoveryQueryOptions(dataSource));
}

export interface TourDiscoveryQuerySnapshot {
  data: readonly TourProductSummaryModel[] | undefined;
  error: Error | null;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
}

export function toTourDiscoveryCollectionState(
  query: TourDiscoveryQuerySnapshot,
): TourDiscoveryCollectionState {
  if (query.data !== undefined) {
    if (query.data.length === 0) {
      return { status: 'empty' };
    }

    return {
      status: 'ready',
      products: query.data,
      freshness: query.isError ? 'stale' : query.isFetching ? 'refreshing' : 'current',
    };
  }

  if (query.isPending) {
    return { status: 'loading' };
  }

  if (query.isError) {
    return {
      status: 'error',
      reason: classifyTourDiscoveryError(query.error),
      isRetrying: query.isFetching,
    };
  }

  return { status: 'loading' };
}
