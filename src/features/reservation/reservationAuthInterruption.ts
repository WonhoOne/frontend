import type { ReservationMutationResult } from '@/features/reservation/reservationMutation';

export interface ReservationAuthInterruption {
  kind: 'reservation-auth-interruption';
  code: string;
  message: string;
}

/**
 * Session D/E public seam.
 *
 * Session D는 인증이 필요하다는 사실만 공개한다.
 * ReturnContext 저장, Login navigation, credential/token 처리, 로그인 성공 후
 * Review restore 및 resubmit은 Session E의 소유권이며 여기서 수행하지 않는다.
 */
export function toReservationAuthInterruption(
  result: ReservationMutationResult,
): ReservationAuthInterruption | null {
  if (result.status !== 'auth-interruption') {
    return null;
  }

  return {
    kind: 'reservation-auth-interruption',
    code: result.code,
    message:
      'Sign in is required before this reservation can be submitted. Your trip is preserved.',
  };
}
