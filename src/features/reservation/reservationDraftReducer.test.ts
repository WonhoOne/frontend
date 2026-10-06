import { describe, expect, it } from 'vitest';

import {
  createEmptyReservationDraft,
  RESERVATION_DRAFT_SCHEMA_VERSION,
  reservationDraftReducer,
  type ReservationDraftV1,
} from '@/features/reservation';

function configuredDraft(): ReservationDraftV1 {
  return {
    schemaVersion: RESERVATION_DRAFT_SCHEMA_VERSION,
    tourProductId: '101',
    tourScheduleId: '1001',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'hotel-a',
      transportSelectionKey: 'transport-a',
      mealSelectionKey: 'meal-a',
      extraSelectionKeys: ['extra-a'],
    },
    updatedAt: 100,
  };
}

describe('reservationDraftReducer', () => {
  it('creates an explicit empty draft without participant or configuration defaults', () => {
    expect(createEmptyReservationDraft(10)).toEqual({
      schemaVersion: 1,
      tourProductId: null,
      tourScheduleId: null,
      tourStyle: null,
      participantCount: null,
      configuration: {
        hotelSelectionKey: null,
        transportSelectionKey: null,
        mealSelectionKey: null,
        extraSelectionKeys: [],
      },
      updatedAt: 10,
    });
  });

  it('begins Configure atomically without leaking participant or configuration intent', () => {
    const next = reservationDraftReducer(configuredDraft(), {
      type: 'BEGIN_CONFIGURE',
      tourProductId: '102',
      tourStyle: 'CLASSIC',
      tourScheduleId: '1002',
      updatedAt: 150,
    });

    expect(next).toEqual({
      ...createEmptyReservationDraft(150),
      tourProductId: '102',
      tourStyle: 'CLASSIC',
      tourScheduleId: '1002',
    });
  });

  it('starts a new product transaction without leaking the previous product intent', () => {
    const next = reservationDraftReducer(configuredDraft(), {
      type: 'START_DRAFT',
      tourProductId: '102',
      updatedAt: 200,
    });

    expect(next).toEqual({
      ...createEmptyReservationDraft(200),
      tourProductId: '102',
    });
  });

  it('updates product choices through domain-specific actions while preserving unrelated intent', () => {
    const initial = {
      ...createEmptyReservationDraft(1),
      tourProductId: '101',
    };

    const withStyle = reservationDraftReducer(initial, {
      type: 'SELECT_TOUR_STYLE',
      tourStyle: 'PREMIUM',
      updatedAt: 2,
    });
    const withSchedule = reservationDraftReducer(withStyle, {
      type: 'SELECT_SCHEDULE',
      tourScheduleId: '1002',
      updatedAt: 3,
    });
    const withParticipants = reservationDraftReducer(withSchedule, {
      type: 'SET_PARTICIPANT_COUNT',
      participantCount: 4,
      updatedAt: 4,
    });

    expect(withParticipants).toMatchObject({
      tourProductId: '101',
      tourStyle: 'PREMIUM',
      tourScheduleId: '1002',
      participantCount: 4,
      updatedAt: 4,
    });
  });

  it('updates each configuration category without resetting sibling selections', () => {
    const afterHotel = reservationDraftReducer(configuredDraft(), {
      type: 'SELECT_HOTEL',
      selectionKey: 'hotel-b',
      updatedAt: 101,
    });
    const afterTransport = reservationDraftReducer(afterHotel, {
      type: 'SELECT_TRANSPORT',
      selectionKey: 'transport-b',
      updatedAt: 102,
    });
    const afterMeal = reservationDraftReducer(afterTransport, {
      type: 'SELECT_MEAL',
      selectionKey: 'meal-b',
      updatedAt: 103,
    });
    const afterExtras = reservationDraftReducer(afterMeal, {
      type: 'SET_EXTRAS',
      selectionKeys: ['extra-b', 'extra-c'],
      updatedAt: 104,
    });

    expect(afterExtras.configuration).toEqual({
      hotelSelectionKey: 'hotel-b',
      transportSelectionKey: 'transport-b',
      mealSelectionKey: 'meal-b',
      extraSelectionKeys: ['extra-b', 'extra-c'],
    });
    expect(afterExtras.updatedAt).toBe(104);
  });

  it('does not invent option compatibility cleanup when only the style changes', () => {
    const next = reservationDraftReducer(configuredDraft(), {
      type: 'SELECT_TOUR_STYLE',
      tourStyle: 'PREMIUM',
      updatedAt: 200,
    });

    expect(next.configuration).toEqual(configuredDraft().configuration);
  });

  it('restores a draft as a new immutable state value', () => {
    const restored = configuredDraft();
    const next = reservationDraftReducer(createEmptyReservationDraft(1), {
      type: 'RESTORE_DRAFT',
      draft: restored,
    });

    expect(next).toEqual(restored);
    expect(next).not.toBe(restored);
    expect(next.configuration).not.toBe(restored.configuration);
    expect(next.configuration.extraSelectionKeys).not.toBe(
      restored.configuration.extraSelectionKeys,
    );
  });

  it.each(['DISCARD_DRAFT', 'CLEAR_AFTER_SUCCESS'] as const)(
    '%s clears all transaction intent',
    (type) => {
      expect(
        reservationDraftReducer(configuredDraft(), {
          type,
          updatedAt: 300,
        }),
      ).toEqual(createEmptyReservationDraft(300));
    },
  );
});
