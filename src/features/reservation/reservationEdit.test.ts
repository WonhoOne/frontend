import { describe, expect, it } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import {
  allowedStylesForReservation,
  isReservationModifiable,
  isSameReservationConfiguration,
  localIsoDate,
  presentReservationEditFailure,
  reservationOptionLabel,
} from '@/features/reservation/reservationEdit';

describe('reservation edit rules', () => {
  it('offers only the styles the theme allows', () => {
    expect(allowedStylesForReservation('HONEYMOON_ROMANCE')).toEqual(['GRAND', 'PREMIUM']);
    expect(allowedStylesForReservation('PARENTS_HEALING')).toEqual(['GRAND', 'PREMIUM']);
    expect(allowedStylesForReservation('GOLF_CHALLENGE')).toEqual(['CLASSIC', 'GRAND', 'PREMIUM']);
    expect(allowedStylesForReservation('OUTDOOR_TREKKING')).toEqual([
      'CLASSIC',
      'GRAND',
      'PREMIUM',
    ]);
  });

  it('allows changes only while the start date is after today', () => {
    expect(isReservationModifiable('2026-11-24', '2026-11-23')).toBe(true);
    expect(isReservationModifiable('2026-11-23', '2026-11-23')).toBe(false);
    expect(isReservationModifiable('2026-11-10', '2026-11-23')).toBe(false);
  });

  it('formats the local calendar date', () => {
    expect(localIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('compares extras as a set', () => {
    const base = {
      style: 'GRAND',
      hotelOption: 'HOTEL_4_STAR',
      transportOption: 'PREMIUM_VAN_10',
      mealOption: 'LOCAL_RESTAURANT',
    } as const;

    expect(
      isSameReservationConfiguration(
        { ...base, extraOptions: ['COFFEE', 'CHAMPAGNE'] },
        { ...base, extraOptions: ['CHAMPAGNE', 'COFFEE'] },
      ),
    ).toBe(true);
    expect(
      isSameReservationConfiguration(
        { ...base, extraOptions: ['COFFEE'] },
        { ...base, extraOptions: [] },
      ),
    ).toBe(false);
  });

  it('uses the shared configure wording for options', () => {
    expect(reservationOptionLabel('PREMIUM_VAN_10')).toBe('Premium van (10)');
    expect(reservationOptionLabel('COFFEE')).toBe('Coffee');
  });
});

describe('presentReservationEditFailure', () => {
  it('closes editing on RESERVATION_NOT_MODIFIABLE', () => {
    const presented = presentReservationEditFailure(
      new ReservationDataSourceError({
        kind: 'conflict',
        code: 'RESERVATION_NOT_MODIFIABLE',
        fieldErrors: [],
      }),
      3,
    );

    expect(presented.closed).toBe(true);
    expect(presented.message).toMatch(/can no longer be changed/);
  });

  it('maps 422 field errors to the edited fields', () => {
    const presented = presentReservationEditFailure(
      new ReservationDataSourceError({
        kind: 'validation',
        code: 'VALIDATION_FAILED',
        fieldErrors: [
          { field: 'configuration.style', code: 'NOT_ALLOWED' },
          { field: 'configuration.transportOption', code: 'CAPACITY_EXCEEDED' },
          { field: 'configuration.extraOptions', code: 'DUPLICATE_VALUE' },
        ],
      }),
      3,
    );

    expect(presented.closed).toBe(false);
    expect(presented.fieldMessages).toEqual({
      style: 'This style is not offered for this tour.',
      transport: 'This transport cannot seat 3 travellers.',
      extras: 'Each extra can be selected only once.',
    });
  });

  it('asks for a refresh when the outcome is unknown', () => {
    expect(
      presentReservationEditFailure(
        new ReservationDataSourceError({ kind: 'network', requestMayHaveReachedServer: true }),
        2,
      ).needsRefresh,
    ).toBe(true);
  });
});
