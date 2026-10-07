import { queryOptions, useQuery } from '@tanstack/react-query';

import type { TourDetailDataSource } from '@/features/tour-detail/TourDetailDataSource';
import { TourDetailPresentationError } from '@/features/tour-detail/tourDetail.adapter';
import type {
  TourDetailCoreErrorReason,
  TourDetailCoreState,
  TourDetailModel,
} from '@/features/tour-detail/tourDetail.model';
import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export function tourDetailQueryKey(tourId: ResourceId) {
  return ['public', 'tour-product', tourId] as const;
}

export function classifyTourDetailError(error: unknown): TourDetailCoreErrorReason {
  if (error instanceof BackendNetworkError || error instanceof BackendRequestAbortedError) {
    return 'network';
  }

  if (
    error instanceof ContractMappingError ||
    error instanceof BackendMalformedResponseError ||
    error instanceof TourDetailPresentationError
  ) {
    return 'data-mismatch';
  }

  return 'server';
}

export function shouldRetryTourDetail(failureCount: number, error: unknown) {
  if (
    error instanceof ContractMappingError ||
    error instanceof BackendMalformedResponseError ||
    error instanceof BackendRequestAbortedError ||
    error instanceof TourDetailPresentationError
  ) {
    return false;
  }

  if (error instanceof BackendHttpError && error.response.status < 500) {
    return false;
  }

  return failureCount < 1;
}

export function tourDetailQueryOptions(dataSource: TourDetailDataSource, tourId: ResourceId) {
  return queryOptions({
    queryKey: tourDetailQueryKey(tourId),
    queryFn: ({ signal }) => dataSource.getTourProduct(tourId, { signal }),
    retry: shouldRetryTourDetail,
  });
}

export function useTourDetail(dataSource: TourDetailDataSource, tourId: ResourceId) {
  return useQuery(tourDetailQueryOptions(dataSource, tourId));
}

export interface TourDetailQuerySnapshot {
  data: TourDetailModel | undefined;
  error: unknown;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
}

export function toTourDetailCoreState(query: TourDetailQuerySnapshot): TourDetailCoreState {
  if (query.data !== undefined) {
    return { status: 'ready', tour: query.data };
  }

  if (query.isPending) {
    return { status: 'loading' };
  }

  if (query.isError) {
    if (query.error instanceof BackendHttpError && query.error.response.status === 404) {
      return { status: 'not-found' };
    }

    return {
      status: 'error',
      reason: classifyTourDetailError(query.error),
      isRetrying: query.isFetching,
    };
  }

  return { status: 'loading' };
}
