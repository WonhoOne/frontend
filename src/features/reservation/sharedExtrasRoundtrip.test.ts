import { describe, expect, it } from 'vitest';

import {
  buildConfigureTripSummary,
  createSharedContractConfigureScenario,
} from '@/features/configuration';
import {
  canonicalReservationCreateIdentityResolver,
  createEmptyReservationDraft,
  createReservationIntent,
  createReservationReviewModel,
  previewReservationReviewResolver,
  reservationDraftReducer,
  toReservationCreateRequestDto,
} from '@/features/reservation';

const scenario = createSharedContractConfigureScenario();

describe('X5 Shared v0.2 Extras projection and reservation contract', () => {
  it.each([
    { keys: [], labels: [] },
    { keys: ['CHAMPAGNE'], labels: ['Champagne'] },
    { keys: ['COFFEE'], labels: ['Coffee'] },
    { keys: ['CHAMPAGNE', 'COFFEE'], labels: ['Champagne', 'Coffee'] },
  ])('keeps $keys identical through Draft, Summary, Review and wire DTO', ({ keys, labels }) => {
    let draft = reservationDraftReducer(createEmptyReservationDraft(1), {
      type: 'BEGIN_CONFIGURE',
      tourProductId: '103',
      tourStyle: 'GRAND',
      tourScheduleId: '1301',
      updatedAt: 2,
    });
    draft = reservationDraftReducer(draft, {
      type: 'SET_PARTICIPANT_COUNT',
      participantCount: 2,
      updatedAt: 3,
    });
    draft = reservationDraftReducer(draft, {
      type: 'SELECT_TRANSPORT',
      selectionKey: 'PRIVATE_LUXURY_CAR_2',
      updatedAt: 4,
    });
    draft = reservationDraftReducer(draft, {
      type: 'SET_EXTRAS',
      selectionKeys: keys,
      updatedAt: 5,
    });

    expect(
      buildConfigureTripSummary({ draft, scenario, participantRule: 'general' }).selections
        .extraLabels,
    ).toEqual(labels);
    expect(
      createReservationReviewModel(draft, previewReservationReviewResolver)?.extraLabels,
    ).toEqual(labels);

    const result = createReservationIntent(draft, canonicalReservationCreateIdentityResolver);
    expect(result.status).toBe('ready');
    if (result.status !== 'ready') throw new Error('Incomplete test transaction');
    expect(toReservationCreateRequestDto(result.input)).toEqual({
      scheduleId: 1301,
      participantCount: 2,
      configuration: {
        style: 'GRAND',
        hotelOption: 'HOTEL_4_STAR',
        transportOption: 'PRIVATE_LUXURY_CAR_2',
        mealOption: 'LOCAL_RESTAURANT',
        extraOptions: keys,
      },
    });
  });
});
