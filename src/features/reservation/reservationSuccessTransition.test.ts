import { describe, expect, it } from 'vitest';
import { createConfirmedReservationTransition } from '@/features/reservation/reservationSuccessTransition';
import type { ReservationModel } from '@/features/reservation/reservation.model';

const reservation = { id: 801 } as ReservationModel;

describe('confirmed reservation transition', () => {
  it('creates draft clear only for confirmed success', () => {
    expect(createConfirmedReservationTransition({ status: 'success', reservation }, 10)).toEqual({
      reservationId: 801,
      draftAction: { type: 'CLEAR_AFTER_SUCCESS', updatedAt: 10 },
    });
  });

  it.each([
    { status: 'auth-interruption', code: 'AUTHENTICATION_REQUIRED' } as const,
    { status: 'failure', error: new Error('failed') } as const,
    { status: 'uncertain', error: new Error('unknown') } as const,
    { status: 'ignored-concurrent-submit' } as const,
  ])('keeps draft for $status', (result) => {
    expect(createConfirmedReservationTransition(result, 10)).toBeNull();
  });
});
