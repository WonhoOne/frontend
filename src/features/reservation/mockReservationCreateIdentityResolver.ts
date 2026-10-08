import { canonicalReservationCreateIdentityResolver } from '@/features/reservation/canonicalReservationCreateIdentityResolver';
import type { ReservationCreateIdentityResolver } from '@/features/reservation/reservationCreateIntent';

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
 * DEV/test fixture compatibility resolver.
 *
 * Canonical v0.2 identities are delegated to the production resolver first.
 * Only explicit fixture/demo keys are handled locally here.
 */
export const mockReservationCreateIdentityResolver: ReservationCreateIdentityResolver = {
  resolveScheduleId: (key) =>
    canonicalReservationCreateIdentityResolver.resolveScheduleId(key) ?? scheduleIds[key] ?? null,
  resolveHotelOption: (key) =>
    canonicalReservationCreateIdentityResolver.resolveHotelOption(key) ??
    hotelOptions[key as keyof typeof hotelOptions] ??
    null,
  resolveTransportOption: (key) =>
    canonicalReservationCreateIdentityResolver.resolveTransportOption(key) ??
    transportOptions[key as keyof typeof transportOptions] ??
    null,
  resolveMealOption: (key) =>
    canonicalReservationCreateIdentityResolver.resolveMealOption(key) ??
    mealOptions[key as keyof typeof mealOptions] ??
    null,
  resolveExtraOption: (key) =>
    canonicalReservationCreateIdentityResolver.resolveExtraOption(key) ??
    extraOptions[key as keyof typeof extraOptions] ??
    null,
};
