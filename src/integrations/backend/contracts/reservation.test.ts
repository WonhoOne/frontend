import { describe, expect, it } from 'vitest';

import {
  ContractMappingError,
  decodeReservationResponseDto,
} from '@/integrations/backend/contracts';

const reservation = {
  id: 801,
  participantCount: 2,
  tourProduct: {
    id: 201,
    theme: 'HONEYMOON_ROMANCE',
    name: 'Synthetic Honeymoon',
  },
  schedule: {
    id: 501,
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    recruitment: {
      unit: 'COUPLE_TEAM',
      currentCount: 1,
      requiredCount: 2,
      confirmed: false,
    },
  },
  configuration: {
    style: 'GRAND',
    hotelOption: 'HOTEL_4_STAR',
    transportOption: 'PRIVATE_LUXURY_CAR_2',
    mealOption: 'LOCAL_RESTAURANT',
    extraOptions: ['CHAMPAGNE'],
  },
  price: {
    unitPrice: 1800000,
    subtotal: 3600000,
    discount: {
      type: 'LOYALTY',
      ratePercent: 5,
      amount: 180000,
    },
    total: 3420000,
    currency: 'KRW',
  },
};

describe('Reservation runtime contract', () => {
  it('decodes the approved POST/GET representation without leaking extra fields', () => {
    expect(decodeReservationResponseDto({ ...reservation, status: 'NOT_IN_V0_2' })).toEqual(
      reservation,
    );
  });

  it('accepts the explicit null discount representation', () => {
    expect(
      decodeReservationResponseDto({
        ...reservation,
        price: { ...reservation.price, discount: null, total: reservation.price.subtotal },
      }).price.discount,
    ).toBeNull();
  });

  it.each([
    ['invalid id', { ...reservation, id: 0 }, '$.id', 'expected-positive-integer'],
    [
      'participant count above contract range',
      { ...reservation, participantCount: 11 },
      '$.participantCount',
      'expected-integer-range',
    ],
    [
      'unknown theme',
      { ...reservation, tourProduct: { ...reservation.tourProduct, theme: 'UNKNOWN' } },
      '$.tourProduct.theme',
      'unknown-enum',
    ],
    [
      'invalid date',
      { ...reservation, schedule: { ...reservation.schedule, startDate: '2026-02-30' } },
      '$.schedule.startDate',
      'invalid-date',
    ],
    [
      'unknown hotel option',
      {
        ...reservation,
        configuration: { ...reservation.configuration, hotelOption: 'HOTEL_6_STAR' },
      },
      '$.configuration.hotelOption',
      'unknown-enum',
    ],
    [
      'duplicate extra option',
      {
        ...reservation,
        configuration: {
          ...reservation.configuration,
          extraOptions: ['COFFEE', 'COFFEE'],
        },
      },
      '$.configuration.extraOptions',
      'duplicate-value',
    ],
    [
      'wrong currency',
      { ...reservation, price: { ...reservation.price, currency: 'USD' } },
      '$.price.currency',
      'invalid-money',
    ],
    [
      'wrong loyalty rate',
      {
        ...reservation,
        price: {
          ...reservation.price,
          discount: { ...reservation.price.discount, ratePercent: 10 },
        },
      },
      '$.price.discount.ratePercent',
      'expected-integer-range',
    ],
  ] as const)('rejects %s', (_name, payload, path, reason) => {
    expect(() => decodeReservationResponseDto(payload)).toThrowError(
      expect.objectContaining({ path, reason }),
    );
  });

  it('rejects an inverted schedule range without deriving reservability or status', () => {
    expect(() =>
      decodeReservationResponseDto({
        ...reservation,
        schedule: {
          ...reservation.schedule,
          startDate: '2026-11-15',
          endDate: '2026-11-14',
        },
      }),
    ).toThrowError(expect.objectContaining({ path: '$.schedule', reason: 'invalid-date-range' }));
  });

  it('does not retain malformed customer-private payloads on mapping errors', () => {
    const privateMarker = 'private-customer-marker';

    try {
      decodeReservationResponseDto({
        ...reservation,
        privateMarker,
        price: { ...reservation.price, total: 'invalid' },
      });
      throw new Error('Expected decode to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContractMappingError);
      expect(String(error)).not.toContain(privateMarker);
      expect(JSON.stringify(error)).not.toContain(privateMarker);
    }
  });
});
