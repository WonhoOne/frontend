import { describe, expect, it } from 'vitest';

import { createEmptyReservationDraft } from '@/features/reservation/ReservationDraft';
import {
  createReservationReviewModel,
  previewReservationReviewResolver,
} from '@/features/reservation/reservationReview';

describe('Reservation Review projection', () => {
  it('returns null for an incomplete Draft', () => {
    expect(
      createReservationReviewModel(createEmptyReservationDraft(1), previewReservationReviewResolver),
    ).toBeNull();
  });

  it('projects a complete Draft without inventing pre-create final price', () => {
    const draft = {
      ...createEmptyReservationDraft(1),
      tourProductId: 'tour-42',
      tourScheduleId: 'schedule-7',
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
