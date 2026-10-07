import { beforeEach, describe, expect, it } from 'vitest';

import { canonicalReservationCreateIdentityResolver } from '@/features/reservation/canonicalReservationCreateIdentityResolver';
import { createEmptyReservationDraft } from '@/features/reservation/ReservationDraft';
import { createReservationIntent } from '@/features/reservation/reservationCreateIntent';
import {
  mockReservationDataSource,
  resetMockReservationDataSource,
} from '@/features/reservation/mockReservationDataSource';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import { toReservationCreateRequestDto } from '@/features/reservation/reservation.adapter';

function createCompleteDraft() {
  return {
    ...createEmptyReservationDraft(1),
    tourProductId: '101',
    tourScheduleId: '501',
    tourStyle: 'GRAND' as const,
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'HOTEL_4_STAR',
      transportSelectionKey: 'PRIVATE_LUXURY_CAR_2',
      mealSelectionKey: 'LOCAL_RESTAURANT',
      extraSelectionKeys: ['COFFEE'],
    },
  };
}

describe('Reservation v0.2 contract core', () => {
  beforeEach(() => {
    resetMockReservationDataSource();
  });

  it('maps canonical Draft intent to the exact Reservation create request boundary', () => {
    const result = createReservationIntent(
      createCompleteDraft(),
      canonicalReservationCreateIdentityResolver,
    );

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

    if (result.status !== 'ready') {
      throw new Error('Expected ready Reservation intent');
    }

    const request = toReservationCreateRequestDto(result.input);
    expect(request).toEqual(result.input);
    expect(request).not.toHaveProperty('customerId');
    expect(request).not.toHaveProperty('tourId');
    expect(request).not.toHaveProperty('theme');
    expect(request).not.toHaveProperty('price');
    expect(request).not.toHaveProperty('discount');
    expect(request).not.toHaveProperty('contact');
    expect(request).not.toHaveProperty('coupleCount');
  });

  it('refuses incomplete, opaque, or unresolved Draft identities instead of guessing wire values', () => {
    expect(
      createReservationIntent(
        createEmptyReservationDraft(1),
        canonicalReservationCreateIdentityResolver,
      ),
    ).toEqual({
      status: 'incomplete-draft',
    });

    const unresolved = createCompleteDraft();
    unresolved.configuration.hotelSelectionKey = 'fixture:hotel:a';

    expect(
      createReservationIntent(unresolved, canonicalReservationCreateIdentityResolver),
    ).toEqual({
      status: 'unresolved-selection',
    });
  });

  it('returns server-shaped price truth only after mock create and supports id lookup', async () => {
    const intent = createReservationIntent(
      createCompleteDraft(),
      canonicalReservationCreateIdentityResolver,
    );
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
