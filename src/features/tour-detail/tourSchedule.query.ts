import { queryOptions, useQuery } from '@tanstack/react-query';

import type { TourScheduleDataSource } from '@/features/tour-detail/TourScheduleDataSource';
import type {
  ScheduleChoiceModel,
  TourScheduleErrorReason,
  TourScheduleSectionState,
} from '@/features/tour-detail/tourDetail.model';
import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export function tourScheduleQueryKey(tourId: ResourceId) {
  return ['public', 'tour-schedules', tourId] as const;
}

export function classifyTourScheduleError(error: unknown): TourScheduleErrorReason {
  if (error instanceof BackendNetworkError || error instanceof BackendRequestAbortedError) {
    return 'network';
  }

  if (error instanceof ContractMappingError || error instanceof BackendMalformedResponseError) {
    return 'data-mismatch';
  }

  return 'server';
}

export function shouldRetryTourSchedule(failureCount: number, error: unknown) {
  if (
    error instanceof ContractMappingError ||
    error instanceof BackendMalformedResponseError ||
    error instanceof BackendRequestAbortedError
  ) {
    return false;
  }

  if (error instanceof BackendHttpError && error.response.status < 500) {
    return false;
  }

  return failureCount < 1;
}

export function tourScheduleQueryOptions(
  dataSource: TourScheduleDataSource,
  tourId: ResourceId,
) {
  return queryOptions({
    queryKey: tourScheduleQueryKey(tourId),
    queryFn: ({ signal }) => dataSource.getTourSchedules(tourId, { signal }),
    retry: shouldRetryTourSchedule,
  });
}

export function useTourSchedules(dataSource: TourScheduleDataSource, tourId: ResourceId) {
  return useQuery(tourScheduleQueryOptions(dataSource, tourId));
}

export interface TourScheduleQuerySnapshot {
  data: readonly ScheduleChoiceModel[] | undefined;
  error: unknown;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
}

export function toTourScheduleSectionState(
  query: TourScheduleQuerySnapshot,
): TourScheduleSectionState {
  if (query.data !== undefined) {
    if (query.data.length === 0) {
      return { status: 'empty' };
    }

    return {
      status: 'ready',
      choices: query.data,
      freshness: query.isError ? 'stale' : query.isFetching ? 'refreshing' : 'current',
    };
  }

  if (query.isPending) {
    return { status: 'loading' };
  }

  if (query.isError) {
    return {
      status: 'error',
      reason: classifyTourScheduleError(query.error),
      isRetrying: query.isFetching,
    };
  }

  return { status: 'loading' };
}
