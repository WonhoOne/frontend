import { beforeEach, describe, expect, it } from 'vitest';

import { createEmptyReservationDraft } from '@/features/reservation/ReservationDraft';
import {
  createReservationIntent,
  type ReservationCreateIdentityResolver,
} from '@/features/reservation/reservationCreateIntent';
import {
  mockReservationDataSource,
  resetMockReservationDataSource,
} from '@/features/reservation/mockReservationDataSource';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';

const resolver: ReservationCreateIdentityResolver = {
  resolveScheduleId: (value) => (value === '501' ? 501 : null),
  resolveHotelOption: (value) => (value === 'hotel-grand' ? 'HOTEL_4_STAR' : null),
  resolveTransportOption: (value) =>
    value === 'transport-private' ? 'PRIVATE_LUXURY_CAR_2' : null,
  resolveMealOption: (value) => (value === 'meal-local' ? 'LOCAL_RESTAURANT' : null),
  resolveExtraOption: (value) => (value === 'extra-coffee' ? 'COFFEE' : null),
};

function createCompleteDraft() {
  return {
    ...createEmptyReservationDraft(1),
    tourProductId: '101',
    tourScheduleId: '501',
    tourStyle: 'GRAND' as const,
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'hotel-grand',
      transportSelectionKey: 'transport-private',
      mealSelectionKey: 'meal-local',
      extraSelectionKeys: ['extra-coffee'],
    },
  };
}

describe('Reservation v0.2 contract core', () => {
  beforeEach(() => {
    resetMockReservationDataSource();
  });

  it('maps Draft intent to the exact Reservation create request boundary', () => {
    const result = createReservationIntent(createCompleteDraft(), resolver);

    expect(result).toEqual({
      status: 'ready',
      input: {
        scheduleId: 501,
        participantCount: 2,
        configuration: {
          style: 'GRAND',
          hotelOption: 'HOTEL_4_STAR',
          transportOption: 'PRIVATE_LUXURY_CAR_2',
          mealOption: 'LOCAL_RESTAURANT',
          extraOptions: ['COFFEE'],
        },
      },
    });

    if (result.status === 'ready') {
      expect(result.input).not.toHaveProperty('customerId');
      expect(result.input).not.toHaveProperty('tourId');
      expect(result.input).not.toHaveProperty('theme');
      expect(result.input).not.toHaveProperty('price');
      expect(result.input).not.toHaveProperty('discount');
      expect(result.input).not.toHaveProperty('coupleCount');
    }
  });

  it('refuses incomplete or unresolved Draft identities instead of guessing wire values', () => {
    expect(createReservationIntent(createEmptyReservationDraft(1), resolver)).toEqual({
      status: 'incomplete-draft',
    });

    const unresolved = createCompleteDraft();
    unresolved.configuration.hotelSelectionKey = 'unknown-hotel';

    expect(createReservationIntent(unresolved, resolver)).toEqual({
      status: 'unresolved-selection',
    });
  });

  it('returns server-shaped price truth only after mock create and supports id lookup', async () => {
    const intent = createReservationIntent(createCompleteDraft(), resolver);
    expect(intent.status).toBe('ready');

    if (intent.status !== 'ready') {
      throw new Error('Expected ready Reservation intent');
    }

    const created = await mockReservationDataSource.createReservation(intent.input);

    expect(created.price).toEqual({
      unitPrice: 1_800_000,
      subtotal: 3_600_000,
      discount: {
        type: 'LOYALTY',
        ratePercent: 5,
        amount: 180_000,
      },
      total: 3_420_000,
      currency: 'KRW',
    });
    expect(created).not.toHaveProperty('status');
    await expect(mockReservationDataSource.getReservation(created.id)).resolves.toEqual(created);
  });

  it('uses v0.2 hidden-resource 404 semantics for an absent Reservation', async () => {
    await expect(mockReservationDataSource.getReservation(999)).rejects.toMatchObject({
      detail: {
        kind: 'not-found',
        code: 'RESERVATION_NOT_FOUND',
      },
    });

    try {
      await mockReservationDataSource.getReservation(999);
    } catch (error) {
      expect(error).toBeInstanceOf(ReservationDataSourceError);
    }
  });
});
