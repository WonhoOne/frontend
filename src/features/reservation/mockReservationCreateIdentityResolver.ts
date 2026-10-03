import type { ReservationCreateIdentityResolver } from '@/features/reservation/reservationCreateIntent';

const hotelOptions = {
  'fixture:hotel:a': 'HOTEL_4_STAR',
  'fixture:hotel:b': 'HOTEL_5_STAR',
} as const;
const transportOptions = {
  'fixture:transport:a': 'PRIVATE_LUXURY_CAR_2',
  'fixture:transport:b': 'PREMIUM_VAN_10',
} as const;
const mealOptions = {
  'fixture:meal:a': 'LOCAL_RESTAURANT',
  'fixture:meal:b': 'PREMIUM_RESTAURANT',
} as const;
const extraOptions = {
  'fixture:extras:a': 'CHAMPAGNE',
  'fixture:extras:b': 'COFFEE',
} as const;

/**
 * PR-06 mock journey의 configuration fixture key를 v0.2 canonical create input으로 변환한다.
 * fixture key 자체를 Backend ID로 간주하지 않는다.
 */
export const mockReservationCreateIdentityResolver: ReservationCreateIdentityResolver = {
  resolveHotelOption: (key) => hotelOptions[key as keyof typeof hotelOptions] ?? null,
  resolveTransportOption: (key) => transportOptions[key as keyof typeof transportOptions] ?? null,
  resolveMealOption: (key) => mealOptions[key as keyof typeof mealOptions] ?? null,
  resolveExtraOption: (key) => extraOptions[key as keyof typeof extraOptions] ?? null,
};
