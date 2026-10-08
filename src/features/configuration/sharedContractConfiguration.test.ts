import { describe, expect, it } from 'vitest';

import { createSharedContractConfigureScenario } from '@/features/configuration';
import { canonicalReservationCreateIdentityResolver } from '@/features/reservation';

describe('Shared v0.2 live configuration scenario', () => {
  it('stores only canonical option IDs accepted by the production Reservation resolver', () => {
    const scenario = createSharedContractConfigureScenario();
    const hotel = scenario.groups.find((group) => group.category === 'hotel');
    const transport = scenario.groups.find((group) => group.category === 'transport');
    const meal = scenario.groups.find((group) => group.category === 'meal');
    const extras = scenario.groups.find((group) => group.category === 'extras');

    expect(hotel).toBeDefined();
    expect(transport).toBeDefined();
    expect(meal).toBeDefined();
    expect(extras).toBeDefined();
    if (
      hotel === undefined ||
      transport === undefined ||
      meal === undefined ||
      extras === undefined
    ) {
      throw new Error('Expected all required Shared v0.2 configuration groups');
    }

    expect(scenario.source).toBe('shared-contract');
    expect(hotel.options.map((option) => option.selectionKey)).toEqual([
      'HOTEL_3_STAR',
      'HOTEL_4_STAR',
      'HOTEL_5_STAR',
    ]);
    expect(transport.options.map((option) => option.selectionKey)).toEqual([
      'PRIVATE_LUXURY_CAR_2',
      'PREMIUM_VAN_10',
    ]);
    expect(meal.options.map((option) => option.selectionKey)).toEqual([
      'LUNCH_BOX',
      'LOCAL_RESTAURANT',
      'PREMIUM_RESTAURANT',
    ]);
    expect(extras).toMatchObject({
      category: 'extras',
      required: false,
      selectionMode: 'multiple',
      heading: 'Extras',
    });
    expect(extras.options.map((option) => option.selectionKey)).toEqual([
      'CHAMPAGNE',
      'COFFEE',
    ]);

    for (const option of hotel.options) {
      expect(
        canonicalReservationCreateIdentityResolver.resolveHotelOption(option.selectionKey),
      ).not.toBeNull();
    }
    for (const option of transport.options) {
      expect(
        canonicalReservationCreateIdentityResolver.resolveTransportOption(option.selectionKey),
      ).not.toBeNull();
    }
    for (const option of meal.options) {
      expect(
        canonicalReservationCreateIdentityResolver.resolveMealOption(option.selectionKey),
      ).not.toBeNull();
    }
    for (const option of extras.options) {
      expect(
        canonicalReservationCreateIdentityResolver.resolveExtraOption(option.selectionKey),
      ).toBe(option.selectionKey);
    }
  });

  it('does not route live configuration through opaque fixture identities', () => {
    const scenario = createSharedContractConfigureScenario();
    expect(
      scenario.groups
        .flatMap((group) => group.options)
        .some((option) => option.selectionKey.startsWith('fixture:')),
    ).toBe(false);
  });
});
