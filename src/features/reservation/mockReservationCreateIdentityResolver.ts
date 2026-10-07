import type { ReservationCreateIdentityResolver } from '@/features/reservation/reservationCreateIntent';
import { parseBackendResourceIdentity } from '@/shared/lib/resourceIdentity';

const scheduleIds: Record<string, number> = {
  'fixture:schedule:a': 301,
  'demo-honeymoon-schedule-a': 301,
};

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
 * Real canonical decimal schedule identities are strictly parsed back to
 * Backend numbers. Explicit DEV fixture identities remain mapped locally.
 */
export const mockReservationCreateIdentityResolver: ReservationCreateIdentityResolver = {
  resolveScheduleId: (key) => parseBackendResourceIdentity(key) ?? scheduleIds[key] ?? null,
  resolveHotelOption: (key) => hotelOptions[key as keyof typeof hotelOptions] ?? null,
  resolveTransportOption: (key) => transportOptions[key as keyof typeof transportOptions] ?? null,
  resolveMealOption: (key) => mealOptions[key as keyof typeof mealOptions] ?? null,
  resolveExtraOption: (key) => extraOptions[key as keyof typeof extraOptions] ?? null,
};
