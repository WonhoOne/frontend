import type { ReservationModel } from '@/features/reservation/reservation.model';

export const mockReservationSuccessFixture: ReservationModel = {
  id: 801,
  participantCount: 2,
  tourProduct: {
    id: 201,
    theme: 'HONEYMOON_ROMANCE',
    name: 'Mock 제주 허니문',
  },
  schedule: {
    id: 301,
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
    style: 'GRAND',
    hotelOption: 'HOTEL_4_STAR',
    transportOption: 'PREMIUM_VAN_10',
    mealOption: 'LOCAL_RESTAURANT',
    extraOptions: ['CHAMPAGNE'],
  },
  price: {
    unitPrice: 1_800_000,
    subtotal: 3_600_000,
    discount: {
      type: 'LOYALTY',
      ratePercent: 5,
      amount: 180_000,
    },
    total: 3_420_000,
    currency: 'KRW',
  },
};
