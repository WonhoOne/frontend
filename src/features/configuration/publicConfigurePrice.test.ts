import { describe, expect, it } from 'vitest';

import { buildPublicConfigurePrice } from '@/features/configuration';

const stylePrices = [
  { style: 'CLASSIC' as const, amount: 1_200_000, currency: 'KRW' as const },
  { style: 'GRAND' as const, amount: 1_800_000, currency: 'KRW' as const },
];

describe('public Configure price boundary', () => {
  it('shows Backend TourProduct unit price without inventing a final total', () => {
    expect(
      buildPublicConfigurePrice({
        participantCount: null,
        selectedStyle: 'GRAND',
        stylePrices,
      }),
    ).toEqual({
      state: 'known',
      totalLabel: '₩1,800,000 per participant',
    });
  });

  it('applies only the shared BR-21 subtotal relationship when participant count is known', () => {
    const price = buildPublicConfigurePrice({
      participantCount: 2,
      selectedStyle: 'GRAND',
      stylePrices,
    });

    expect(price).toEqual({
      state: 'known',
      totalLabel: 'Estimated subtotal ₩3,600,000 · ₩1,800,000 per participant',
    });
    expect(price).not.toHaveProperty('discount');
    expect(price).not.toHaveProperty('total');
  });

  it('does not fabricate a price when style or its Backend price is unavailable', () => {
    expect(
      buildPublicConfigurePrice({
        participantCount: 2,
        selectedStyle: null,
        stylePrices,
      }),
    ).toMatchObject({ state: 'unavailable' });

    expect(
      buildPublicConfigurePrice({
        participantCount: 2,
        selectedStyle: 'PREMIUM',
        stylePrices,
      }),
    ).toMatchObject({ state: 'unavailable' });
  });
});
