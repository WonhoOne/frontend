import { useQuery } from '@tanstack/react-query';

import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import { reservationQueryKeys } from '@/features/reservation/reservation.queryKeys';

export function shouldRetryReservationDetail(failureCount: number, error: unknown) {
  if (!(error instanceof ReservationDataSourceError)) {
    return false;
  }

  if (
    error.detail.kind === 'authentication-required' ||
    error.detail.kind === 'forbidden' ||
    error.detail.kind === 'not-found' ||
    error.detail.kind === 'conflict' ||
    error.detail.kind === 'validation' ||
    error.detail.kind === 'unknown'
  ) {
    return false;
  }

  return failureCount < 1;
}

export function reservationDetailQueryOptions(
  dataSource: Pick<ReservationDataSource, 'getReservation'>,
  reservationId: number,
) {
  return {
    queryKey: reservationQueryKeys.detail(reservationId),
    queryFn: () => dataSource.getReservation(reservationId),
    meta: { privacy: 'private' as const },
    retry: shouldRetryReservationDetail,
  };
}

/**
 * Shared private Reservation read for Success and Detail.
 * Invalid route identities are disabled and never promoted to a Backend ID.
 */
export function useReservationDetail(
  dataSource: Pick<ReservationDataSource, 'getReservation'>,
  reservationId: number | null,
) {
  return useQuery({
    queryKey:
      reservationId === null
        ? (['reservation', 'detail', 'invalid'] as const)
        : reservationQueryKeys.detail(reservationId),
    queryFn: () => {
      if (reservationId === null) {
        return Promise.reject(new Error('Invalid reservation identity.'));
      }

      return dataSource.getReservation(reservationId);
    },
    meta: { privacy: 'private' as const },
    retry: shouldRetryReservationDetail,
    enabled: reservationId !== null,
  });
}
