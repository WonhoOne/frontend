import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import type {
  CreateReservationInput,
  ReservationModel,
} from '@/features/reservation/reservation.model';

export type ReservationMutationState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; reservation: ReservationModel }
  | { status: 'auth-interruption'; code: string }
  | { status: 'failure'; error: unknown }
  | { status: 'uncertain'; error: unknown };

export type ReservationMutationResult =
  | { status: 'success'; reservation: ReservationModel }
  | { status: 'auth-interruption'; code: string }
  | { status: 'failure'; error: unknown }
  | { status: 'uncertain'; error: unknown }
  | { status: 'ignored-concurrent-submit' };

export interface ReservationMutationController {
  getState(): ReservationMutationState;
  submit(input: CreateReservationInput): Promise<ReservationMutationResult>;
  reset(): void;
}

function reservationDataError(error: unknown) {
  return error instanceof ReservationDataSourceError ? error.detail : null;
}

function isAmbiguousCreateError(error: unknown) {
  const detail = reservationDataError(error);
  return detail?.kind === 'network' && detail.requestMayHaveReachedServer === true;
}

function getAuthenticationInterruption(error: unknown) {
  const detail = reservationDataError(error);
  return detail?.kind === 'authentication-required' ? detail : null;
}

/**
 * Reservation create의 action-level concurrency boundary다.
 *
 * INVARIANT:
 * - button disabled 여부와 무관하게 in-flight mutation은 정확히 하나만 허용한다.
 * - create mutation은 자동 retry하지 않는다.
 * - 401은 Login/navigation을 실행하지 않고 auth-interruption public outcome으로만 노출한다.
 * - response가 유실돼 서버 처리 여부를 모르면 Failure가 아니라 Uncertain이다.
 * - navigation/Draft clear는 이 controller의 책임이 아니다. caller가 confirmed Success만 보고 수행한다.
 */
export function createReservationMutationController(
  dataSource: Pick<ReservationDataSource, 'createReservation'>,
): ReservationMutationController {
  let state: ReservationMutationState = { status: 'idle' };
  let inFlight = false;

  return {
    getState: () => state,

    async submit(input) {
      if (inFlight) {
        return { status: 'ignored-concurrent-submit' };
      }

      inFlight = true;
      state = { status: 'submitting' };

      try {
        // CONTRACT: deliberate single attempt. No retry loop belongs here.
        const reservation = await dataSource.createReservation(input);
        state = { status: 'success', reservation };
        return { status: 'success', reservation };
      } catch (error) {
        const authInterruption = getAuthenticationInterruption(error);
        if (authInterruption !== null) {
          state = { status: 'auth-interruption', code: authInterruption.code };
          return { status: 'auth-interruption', code: authInterruption.code };
        }

        if (isAmbiguousCreateError(error)) {
          state = { status: 'uncertain', error };
          return { status: 'uncertain', error };
        }

        state = { status: 'failure', error };
        return { status: 'failure', error };
      } finally {
        inFlight = false;
      }
    },

    reset() {
      if (!inFlight) {
        state = { status: 'idle' };
      }
    },
  };
}
