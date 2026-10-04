import { describe, expect, it } from 'vitest';

import { adaptTourProductDto, themeDiscoveryPresentations } from '@/features/tour-discovery';
import type { TourProductDto } from '@/integrations/backend/contracts';

const dto: TourProductDto = {
  id: 41,
  theme: 'GOLF_CHALLENGE',
  name: 'Backend Golf Journey',
  description: 'Backend-owned description.',
  availableStyles: ['CLASSIC', 'GRAND'],
  stylePrices: [
    { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
    { style: 'GRAND', amount: 1800000, currency: 'KRW' },
  ],
};

describe('TourProduct DTO adapter', () => {
  it('keeps Backend product truth while joining Frontend-owned editorial media', () => {
    const model = adaptTourProductDto(dto);
    const presentation = themeDiscoveryPresentations.find(
      (item) => item.theme === 'GOLF_CHALLENGE',
    );

    expect(model).toMatchObject({
      id: 41,
      theme: 'GOLF_CHALLENGE',
      name: 'Backend Golf Journey',
      description: 'Backend-owned description.',
      availableStyles: ['CLASSIC', 'GRAND'],
      stylePrices: [
        { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
        { style: 'GRAND', amount: 1800000, currency: 'KRW' },
      ],
    });
    expect(model.media).toEqual(presentation?.media);
  });

  it('does not invent Backend-absent destination, duration, schedule, or reservation fields', () => {
    const model = adaptTourProductDto(dto);

    expect(model).not.toHaveProperty('destination');
    expect(model).not.toHaveProperty('duration');
    expect(model).not.toHaveProperty('schedule');
    expect(model).not.toHaveProperty('reservation');
  });
});
