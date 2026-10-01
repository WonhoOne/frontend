import { describe, expect, it } from 'vitest';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import { beginReservationRefresh, lookupReservation, visibleReservationFromLookup } from '@/features/reservation/reservationLookup';
import { mockReservationSuccessFixture } from '@/features/reservation/reservationSuccessFixture';

describe('reservation lookup stale preservation', () => {
  it('keeps the last confirmed reservation visible while refreshing', () => {
    expect(visibleReservationFromLookup(beginReservationRefresh(mockReservationSuccessFixture))).toBe(mockReservationSuccessFixture);
  });

  it('keeps previous truth when refresh fails over the network', async () => {
    const state = await lookupReservation(
      { getReservation: async () => { throw new ReservationDataSourceError({ kind: 'network', requestMayHaveReachedServer: false }); } },
      801,
      mockReservationSuccessFixture,
    );
    expect(state.status).toBe('network-error');
    expect(visibleReservationFromLookup(state)).toBe(mockReservationSuccessFixture);
  });

  it('does not invent stale content for a first-load failure', async () => {
    const state = await lookupReservation(
      { getReservation: async () => { throw new ReservationDataSourceError({ kind: 'server', code: 'SERVER_ERROR' }); } },
      801,
    );
    expect(visibleReservationFromLookup(state)).toBeNull();
  });
});
