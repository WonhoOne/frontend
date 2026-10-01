import { describe, expect, it } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import {
  createOfflineBeforeSubmitRecovery,
  getReservationNetworkRecovery,
} from '@/features/reservation/reservationNetworkSafety';

describe('Reservation network recovery policy', () => {
  it('marks offline-before-submit as definitely unsent and keeps Draft', () => {
    expect(createOfflineBeforeSubmitRecovery()).toEqual({
      kind: 'offline-before-submit',
      retryPolicy: 'manual-after-reconnect',
      reservationMayExist: false,
      keepDraft: true,
    });
  });

  it('keeps ordinary network and server failures manual with Draft preserved', () => {
    const network = new ReservationDataSourceError({ kind: 'network', requestMayHaveReachedServer: false });
    const server = new ReservationDataSourceError({ kind: 'server', code: 'INTERNAL_ERROR' });

    expect(getReservationNetworkRecovery({ status: 'failure', error: network })).toEqual({
      kind: 'network-failure', retryPolicy: 'manual', reservationMayExist: false, keepDraft: true,
    });
    expect(getReservationNetworkRecovery({ status: 'failure', error: server })).toEqual({
      kind: 'server-failure', retryPolicy: 'manual', reservationMayExist: false, keepDraft: true,
    });
  });

  it('blocks retry when a create may already exist', () => {
    const error = new ReservationDataSourceError({ kind: 'network', requestMayHaveReachedServer: true });
    expect(getReservationNetworkRecovery({ status: 'uncertain', error })).toEqual({
      kind: 'ambiguous-outcome',
      retryPolicy: 'blocked-until-resolved',
      reservationMayExist: true,
      keepDraft: true,
    });
  });
});
