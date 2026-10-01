import { describe, expect, it } from 'vitest';

import {
  canSubmitReservationReview,
  presentReservationReviewValidation,
} from '@/features/reservation/reservationReviewValidation';

describe('Reservation Review validation state', () => {
  it.each([
    ['schedule-not-reservable', 'tour-detail'],
    ['configuration-invalid', 'configure'],
    ['participant-invalid', 'configure'],
    ['transport-capacity-invalid', 'configure'],
  ] as const)('keeps %s blocked until explicit correction', (reason, target) => {
    const state = { status: 'blocking' as const, reason };
    expect(canSubmitReservationReview(state)).toBe(false);
    expect(presentReservationReviewValidation(state)).toMatchObject({
      tone: 'blocking',
      correctionTarget: target,
      requiresReconfirmation: true,
    });
  });

  it('requires explicit reconfirmation when price changes', () => {
    const state = {
      status: 'price-changed' as const,
      previousTotal: 3_600_000,
      latestTotal: 3_800_000,
      currency: 'KRW' as const,
    };
    expect(canSubmitReservationReview(state)).toBe(false);
    expect(presentReservationReviewValidation(state).requiresReconfirmation).toBe(true);
  });

  it('keeps previous truth visible while refreshing or offline', () => {
    expect(
      presentReservationReviewValidation({ status: 'refreshing', previous: { status: 'valid' } }),
    ).toMatchObject({ title: 'Checking the latest trip details', correctionTarget: null });

    expect(
      presentReservationReviewValidation({ status: 'offline', previous: { status: 'valid' } }),
    ).toMatchObject({ title: 'You are offline', correctionTarget: null });

    expect(canSubmitReservationReview({ status: 'offline', previous: { status: 'valid' } })).toBe(
      false,
    );
  });

  it('allows submit eligibility only for a freshly valid state', () => {
    expect(canSubmitReservationReview({ status: 'valid' })).toBe(true);
    expect(canSubmitReservationReview({ status: 'loading' })).toBe(false);
  });
});
