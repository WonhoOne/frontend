import { describe, expect, it } from 'vitest';

import { createSharedContractConfigureScenario } from '@/features/configuration';
import { canonicalReservationCreateIdentityResolver } from '@/features/reservation';

describe('Shared v0.2 live configuration scenario', () => {
  it('stores only canonical option IDs accepted by the production Reservation resolver', () => {
    const scenario = createSharedContractConfigureScenario();
    const groups = Object.fromEntries(scenario.groups.map((group) => [group.category, group]));

    expect(scenario.source).toBe('shared-contract');
    expect(groups.hotel.options.map((option) => option.selectionKey)).toEqual([
      'HOTEL_3_STAR',
      'HOTEL_4_STAR',
      'HOTEL_5_STAR',
    ]);
    expect(groups.transport.options.map((option) => option.selectionKey)).toEqual([
      'PRIVATE_LUXURY_CAR_2',
      'PREMIUM_VAN_10',
    ]);
    expect(groups.meal.options.map((option) => option.selectionKey)).toEqual([
      'LUNCH_BOX',
      'LOCAL_RESTAURANT',
      'PREMIUM_RESTAURANT',
    ]);

    for (const option of groups.hotel.options) {
      expect(canonicalReservationCreateIdentityResolver.resolveHotelOption(option.selectionKey)).not.toBeNull();
    }
    for (const option of groups.transport.options) {
      expect(
        canonicalReservationCreateIdentityResolver.resolveTransportOption(option.selectionKey),
      ).not.toBeNull();
    }
    for (const option of groups.meal.options) {
      expect(canonicalReservationCreateIdentityResolver.resolveMealOption(option.selectionKey)).not.toBeNull();
    }
  });

  it('does not route live configuration through opaque fixture identities', () => {
    const scenario = createSharedContractConfigureScenario();
    expect(scenario.groups.flatMap((group) => group.options).some((option) => option.selectionKey.startsWith('fixture:'))).toBe(false);
  });
});
