import { describe, expect, it } from 'vitest';

import {
  createEmptyReservationDraft,
  getConfigureDraftEntryState,
  getReviewDraftHandoffState,
  type ReservationDraftV1,
} from '@/features/reservation';

function completeDraft(): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: 'tour-a',
    tourScheduleId: 'schedule-a',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'hotel-a',
      transportSelectionKey: 'transport-a',
      mealSelectionKey: 'meal-a',
      extraSelectionKeys: [],
    },
    updatedAt: 1,
  };
}

describe('ReservationDraft route recovery', () => {
  it('distinguishes an empty Draft from discarded storage', () => {
    const empty = createEmptyReservationDraft(1);

    expect(
      getConfigureDraftEntryState({
        draft: empty,
        hydrationStatus: 'empty',
        routeTourProductId: 'tour-a',
      }),
    ).toEqual({ status: 'missing' });

    expect(
      getConfigureDraftEntryState({
        draft: empty,
        hydrationStatus: 'discarded',
        routeTourProductId: 'tour-a',
      }),
    ).toEqual({ status: 'discarded' });
  });

  it('preserves a mismatched saved trip instead of treating it as the current route', () => {
    expect(
      getConfigureDraftEntryState({
        draft: completeDraft(),
        hydrationStatus: 'restored',
        routeTourProductId: 'tour-b',
      }),
    ).toEqual({
      status: 'route-mismatch',
      savedTourProductId: 'tour-a',
    });
  });

  it('requires Style and Schedule before Configure is ready', () => {
    expect(
      getConfigureDraftEntryState({
        draft: {
          ...completeDraft(),
          tourScheduleId: null,
        },
        hydrationStatus: 'restored',
        routeTourProductId: 'tour-a',
      }),
    ).toEqual({ status: 'incomplete' });
  });

  it('requires required transaction intent before the Review handoff is ready', () => {
    expect(
      getReviewDraftHandoffState({
        draft: {
          ...completeDraft(),
          configuration: {
            ...completeDraft().configuration,
            mealSelectionKey: null,
          },
        },
        hydrationStatus: 'restored',
      }),
    ).toEqual({
      status: 'incomplete',
      tourProductId: 'tour-a',
    });

    expect(
      getReviewDraftHandoffState({
        draft: completeDraft(),
        hydrationStatus: 'restored',
      }),
    ).toEqual({
      status: 'ready',
      tourProductId: 'tour-a',
    });
  });
});
