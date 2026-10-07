import { describe, expect, it } from 'vitest';

import { canonicalReservationCreateIdentityResolver as resolver } from '@/features/reservation/canonicalReservationCreateIdentityResolver';

describe('canonicalReservationCreateIdentityResolver', () => {
  it('promotes canonical Backend schedule and option identities', () => {
    expect(resolver.resolveScheduleId('501')).toBe(501);
    expect(resolver.resolveHotelOption('HOTEL_4_STAR')).toBe('HOTEL_4_STAR');
    expect(resolver.resolveTransportOption('PRIVATE_LUXURY_CAR_2')).toBe('PRIVATE_LUXURY_CAR_2');
    expect(resolver.resolveMealOption('LOCAL_RESTAURANT')).toBe('LOCAL_RESTAURANT');
    expect(resolver.resolveExtraOption('COFFEE')).toBe('COFFEE');
  });

  it.each(['0', '-1', '01', '1.5', ' 501', '501 ', 'fixture:schedule:a'])(
    'rejects non-canonical schedule identity %j',
    (value) => {
      expect(resolver.resolveScheduleId(value)).toBeNull();
    },
  );

  it('rejects opaque fixture and unknown option identities', () => {
    expect(resolver.resolveHotelOption('fixture:hotel:a')).toBeNull();
    expect(resolver.resolveTransportOption('fixture:transport:a')).toBeNull();
    expect(resolver.resolveMealOption('fixture:meal:a')).toBeNull();
    expect(resolver.resolveExtraOption('fixture:extras:a')).toBeNull();
    expect(resolver.resolveHotelOption('HOTEL_6_STAR')).toBeNull();
  });
});
