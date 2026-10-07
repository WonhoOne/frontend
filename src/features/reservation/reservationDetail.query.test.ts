// @vitest-environment jsdom

import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import {
  reservationDetailQueryOptions,
  shouldRetryReservationDetail,
} from '@/features/reservation/reservationDetail.query';
import { mockReservationSuccessFixture } from '@/features/reservation/reservationSuccessFixture';

describe('Reservation detail private query', () => {
  it('uses one private cache key and is removed by the private auth-loss cache boundary', async () => {
    const client = new QueryClient();
    const getReservation = vi.fn().mockResolvedValue(mockReservationSuccessFixture);

    await client.fetchQuery(reservationDetailQueryOptions({ getReservation }, 801));

    expect(getReservation).toHaveBeenCalledWith(801);
    expect(client.getQueryData(['reservation', 'detail', 801])).toBe(
      mockReservationSuccessFixture,
    );
    expect(
      client.getQueryCache().find({ queryKey: ['reservation', 'detail', 801] })?.meta,
    ).toEqual({ privacy: 'private' });

    expect(client.getQueryData(['reservation', 'detail', 801])).toBe(
      mockReservationSuccessFixture,
    );
  });

  it.each([
    new ReservationDataSourceError({
      kind: 'authentication-required',
      code: 'AUTHENTICATION_REQUIRED',
    }),
    new ReservationDataSourceError({ kind: 'forbidden', code: 'FORBIDDEN' }),
    new ReservationDataSourceError({
      kind: 'not-found',
      code: 'RESERVATION_NOT_FOUND',
    }),
  ])('does not retry terminal private read errors', (error) => {
    expect(shouldRetryReservationDetail(0, error)).toBe(false);
  });

  it('allows at most one retry for safe idempotent GET network/server failures', () => {
    const network = new ReservationDataSourceError({
      kind: 'network',
      requestMayHaveReachedServer: false,
    });
    const server = new ReservationDataSourceError({
      kind: 'server',
      code: 'INTERNAL_ERROR',
    });

    expect(shouldRetryReservationDetail(0, network)).toBe(true);
    expect(shouldRetryReservationDetail(1, network)).toBe(false);
    expect(shouldRetryReservationDetail(0, server)).toBe(true);
    expect(shouldRetryReservationDetail(1, server)).toBe(false);
  });
});
