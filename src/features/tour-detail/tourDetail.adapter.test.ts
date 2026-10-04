import { describe, expect, it } from 'vitest';

import {
  adaptTourProductDetailDto,
  adaptTourScheduleDto,
} from '@/features/tour-detail';
import { ContractMappingError, type TourProductDto, type TourScheduleDto } from '@/integrations/backend/contracts';

const product: TourProductDto = {
  id: 103,
  theme: 'GOLF_CHALLENGE',
  name: 'Backend Golf Journey',
  description: 'Backend-owned product description.',
  availableStyles: ['CLASSIC', 'GRAND'],
  stylePrices: [
    { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
    { style: 'GRAND', amount: 1800000, currency: 'KRW' },
  ],
};

describe('Tour Detail adapters', () => {
  it('keeps Backend product truth and joins only Frontend editorial presentation', () => {
    const model = adaptTourProductDetailDto(product);

    expect(model).toMatchObject({
      id: 103,
      theme: 'GOLF_CHALLENGE',
      name: 'Backend Golf Journey',
      summary: 'Backend-owned product description.',
      availableStyles: ['CLASSIC', 'GRAND'],
      stylePrices: [
        { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
        { style: 'GRAND', amount: 1800000, currency: 'KRW' },
      ],
    });
    expect(model.themeLabel).toBe('Golf Challenge');
    expect(model.includedExperiences).toHaveLength(3);
  });

  it('maps schedule truth without deriving reservability or recruitment confirmation', () => {
    const dto: TourScheduleDto = {
      id: 1301,
      tourId: 103,
      startDate: '2027-03-10',
      endDate: '2027-03-14',
      reservable: true,
      recruitment: {
        unit: 'PARTICIPANT',
        currentCount: 2,
        requiredCount: 3,
        confirmed: false,
      },
    };

    expect(adaptTourScheduleDto(dto, 103)).toEqual({
      selectionKey: 1301,
      dateLabel: '2027-03-10 – 2027-03-14',
      statusLabel: 'Reservation available',
      recruitmentSummary: '2 / 3 participants · Not confirmed',
      isSelectable: true,
    });
  });

  it('rejects a schedule returned for a different TourProduct identity', () => {
    const dto: TourScheduleDto = {
      id: 1301,
      tourId: 104,
      startDate: '2027-03-10',
      endDate: '2027-03-14',
      reservable: true,
      recruitment: {
        unit: 'PARTICIPANT',
        currentCount: 2,
        requiredCount: 3,
        confirmed: false,
      },
    };

    expect(() => adaptTourScheduleDto(dto, 103)).toThrow(ContractMappingError);
  });
});
