import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import type { ReservationMutationResult } from '@/features/reservation/reservationMutation';

export type ReservationNetworkRecovery =
  | { kind: 'offline-before-submit'; retryPolicy: 'manual-after-reconnect'; reservationMayExist: false; keepDraft: true }
  | { kind: 'network-failure'; retryPolicy: 'manual'; reservationMayExist: false; keepDraft: true }
  | { kind: 'server-failure'; retryPolicy: 'manual'; reservationMayExist: false; keepDraft: true }
  | { kind: 'ambiguous-outcome'; retryPolicy: 'blocked-until-resolved'; reservationMayExist: true; keepDraft: true };

export function createOfflineBeforeSubmitRecovery(): ReservationNetworkRecovery {
  return { kind: 'offline-before-submit', retryPolicy: 'manual-after-reconnect', reservationMayExist: false, keepDraft: true };
}

/** Ambiguous create는 중복 예약 위험 때문에 재시도하지 않고 Draft를 보존한다. */
export function getReservationNetworkRecovery(result: ReservationMutationResult): ReservationNetworkRecovery | null {
  if (result.status === 'uncertain') {
    return { kind: 'ambiguous-outcome', retryPolicy: 'blocked-until-resolved', reservationMayExist: true, keepDraft: true };
  }
  if (result.status !== 'failure' || !(result.error instanceof ReservationDataSourceError)) return null;
  if (result.error.detail.kind === 'network') {
    return { kind: 'network-failure', retryPolicy: 'manual', reservationMayExist: false, keepDraft: true };
  }
  if (result.error.detail.kind === 'server') {
    return { kind: 'server-failure', retryPolicy: 'manual', reservationMayExist: false, keepDraft: true };
  }
  return null;
}
