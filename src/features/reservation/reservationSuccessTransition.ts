import type { ReservationDraftAction } from '@/features/reservation/reservationDraftReducer';
import type { ReservationMutationResult } from '@/features/reservation/reservationMutation';

export interface ConfirmedReservationTransition {
  reservationId: number;
  draftAction: ReservationDraftAction;
}

/** Reservation create가 성공한 경우에만 Draft 정리 action을 만든다. */
export function createConfirmedReservationTransition(
  result: ReservationMutationResult,
  updatedAt: number,
): ConfirmedReservationTransition | null {
  if (result.status !== 'success') return null;
  return {
    reservationId: result.reservation.id,
    draftAction: { type: 'CLEAR_AFTER_SUCCESS', updatedAt },
  };
}
