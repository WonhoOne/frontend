import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import type {
  CreateReservationInput,
  ReservationModel,
} from '@/features/reservation/reservation.model';
import { mockReservationSuccessFixture } from '@/features/reservation/reservationSuccessFixture';

const MOCK_RESERVATION_ID = 801;

const mockReservationById = new Map<number, ReservationModel>();

function buildMockReservation(input: CreateReservationInput): ReservationModel {
  const subtotal = 1_800_000 * input.participantCount;
  const discountAmount = Math.floor(subtotal * 0.05);

  return {
    id: MOCK_RESERVATION_ID,
    participantCount: input.participantCount,
    tourProduct: {
      id: 201,
      theme: 'HONEYMOON_ROMANCE',
      name: 'Mock 제주 허니문',
    },
    schedule: {
      id: input.scheduleId,
      startDate: '2026-11-10',
      endDate: '2026-11-14',
      recruitment: {
        unit: 'COUPLE_TEAM',
        currentCount: 1,
        requiredCount: 2,
        confirmed: false,
      },
    },
    configuration: {
      ...input.configuration,
      extraOptions: [...input.configuration.extraOptions],
    },
    price: {
      unitPrice: 1_800_000,
      subtotal,
      discount: {
        type: 'LOYALTY',
        ratePercent: 5,
        amount: discountAmount,
      },
      total: subtotal - discountAmount,
      currency: 'KRW',
    },
  };
}

/**
 * PR-06 전용 mock-backed Reservation port 구현.
 *
 * MOCK CONTRACT:
 * - 실제 HTTP/fetch를 호출하지 않는다.
 * - 반환값은 Shared v0.2의 server-truth 의미를 표현한다.
 * - price는 Draft가 아니라 create 결과에서 처음 확정된다.
 */
export const mockReservationDataSource: ReservationDataSource = {
  async createReservation(input) {
    const reservation = buildMockReservation(input);
    mockReservationById.set(reservation.id, reservation);
    return reservation;
  },

  async getReservation(reservationId) {
    const reservation =
      mockReservationById.get(reservationId) ??
      (reservationId === mockReservationSuccessFixture.id ? mockReservationSuccessFixture : undefined);

    if (reservation === undefined) {
      throw new ReservationDataSourceError({
        kind: 'not-found',
        code: 'RESERVATION_NOT_FOUND',
      });
    }

    return reservation;
  },
};

export function resetMockReservationDataSource() {
  mockReservationById.clear();
}
