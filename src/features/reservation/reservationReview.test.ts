import { adaptTourProductDetailDto, adaptTourScheduleDto } from '@/features/tour-detail';

import { describe, expect, it } from 'vitest';

import { createEmptyReservationDraft } from '@/features/reservation/ReservationDraft';
import {
  createReservationReviewModel,
  createReservationReviewSelectionResolver,
  previewReservationReviewResolver,
} from '@/features/reservation/reservationReview';

describe('Reservation Review projection', () => {
  it('returns null for an incomplete Draft', () => {
    expect(
      createReservationReviewModel(
        createEmptyReservationDraft(1),
        previewReservationReviewResolver,
      ),
    ).toBeNull();
  });

  it('projects a complete Draft without inventing pre-create final price', () => {
    const draft = {
      ...createEmptyReservationDraft(1),
      tourProductId: '42',
      tourScheduleId: '7',
      tourStyle: 'GRAND' as const,
      participantCount: 2,
      configuration: {
        hotelSelectionKey: 'fixture:hotel:a',
        transportSelectionKey: 'fixture:transport:b',
        mealSelectionKey: 'fixture:meal:a',
        extraSelectionKeys: ['fixture:extras:b'],
      },
    };

    const review = createReservationReviewModel(draft, previewReservationReviewResolver);

    expect(review).toMatchObject({
      styleLabel: 'Grand',
      participantLabel: '2 participants',
      hotelLabel: 'Fixture hotel A',
      transportLabel: 'Fixture transport B',
      mealLabel: 'Fixture meal A',
      extraLabels: ['Fixture extra B'],
      price: { status: 'finalized-on-create' },
    });
    expect(review).not.toHaveProperty('price.total');
  });
});

describe('loaded Reservation Review identity resolver', () => {
  const tour = adaptTourProductDetailDto({
    id: 42,
    theme: 'GOLF_CHALLENGE',
    name: 'F2 Synthetic Golf',
    description: 'Real product',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'CLASSIC', amount: 100000, currency: 'KRW' },
      { style: 'GRAND', amount: 200000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 300000, currency: 'KRW' },
    ],
  });
  const schedules = [302, 301].map((id) =>
    adaptTourScheduleDto(
      {
        id,
        tourId: 42,
        startDate: '2026-11-14',
        endDate: '2026-11-18',
        reservable: true,
        recruitment: { unit: 'PARTICIPANT', currentCount: 0, requiredCount: 3, confirmed: false },
      },
      42,
    ),
  );
  const draft = {
    ...createEmptyReservationDraft(1),
    tourProductId: '42',
    tourScheduleId: '301',
    tourStyle: 'GRAND' as const,
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'HOTEL_4_STAR',
      transportSelectionKey: 'PREMIUM_VAN_10',
      mealSelectionKey: 'LOCAL_RESTAURANT',
      extraSelectionKeys: ['COFFEE', 'CHAMPAGNE'],
    },
  };
  it('matches the canonical selectionKey and preserves all other projection labels and Draft', () => {
    const original = structuredClone(draft);
    const choices = [
      { ...schedules[0]!, dateLabel: 'Other schedule' },
      { ...schedules[1]!, dateLabel: 'Feature-owned date label' },
    ];
    const resolver = createReservationReviewSelectionResolver(draft, tour, choices);
    expect(resolver).not.toBeNull();
    const model = createReservationReviewModel(draft, resolver!);
    expect(model).toMatchObject({
      tourProductLabel: 'F2 Synthetic Golf',
      scheduleLabel: 'Feature-owned date label',
      styleLabel: 'Grand',
      participantLabel: '2 participants',
      hotelLabel: '4-star hotel',
      transportLabel: 'Premium van (10)',
      mealLabel: 'Local restaurant',
      extraLabels: ['Coffee', 'Champagne'],
    });
    expect(draft).toEqual(original);
  });
  it('rejects mismatched products, missing schedules and noncanonical aliases', () => {
    expect(
      createReservationReviewSelectionResolver(draft, { ...tour, id: '43' }, schedules),
    ).toBeNull();
    expect(createReservationReviewSelectionResolver(draft, tour, [])).toBeNull();
    expect(
      createReservationReviewSelectionResolver(
        { ...draft, tourScheduleId: '0301' },
        tour,
        schedules,
      ),
    ).toBeNull();
  });
});
