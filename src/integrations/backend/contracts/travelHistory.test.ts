import { describe, expect, it } from 'vitest';

import {
  ContractMappingError,
  decodeTravelHistoryItemDto,
  decodeTravelHistoryListDto,
} from '@/integrations/backend/contracts';

const recentTrip = {
  reservationId: 801,
  tourProduct: {
    id: 201,
    theme: 'GOLF_CHALLENGE',
    name: 'Synthetic Golf',
  },
  startDate: '2026-09-26',
  endDate: '2026-09-30',
  style: 'GRAND',
  price: {
    amount: 402000,
    currency: 'KRW',
  },
};

describe('Travel History runtime contract', () => {
  it('decodes the exact v0.2 item representation', () => {
    expect(
      decodeTravelHistoryItemDto({
        ...recentTrip,
        participantCount: 'must-not-leak-into-model',
      }),
    ).toEqual(recentTrip);
  });

  it('preserves Backend collection ordering instead of sorting in the decoder', () => {
    const olderTrip = {
      ...recentTrip,
      reservationId: 700,
      startDate: '2026-08-01',
      endDate: '2026-08-05',
    };

    expect(decodeTravelHistoryListDto([recentTrip, olderTrip])).toEqual([recentTrip, olderTrip]);
  });

  it.each([
    [
      'unsafe reservation id',
      { ...recentTrip, reservationId: Number.MAX_SAFE_INTEGER + 1 },
      '$.reservationId',
      'expected-positive-integer',
    ],
    ['unknown style', { ...recentTrip, style: 'DELUXE' }, '$.style', 'unknown-enum'],
    ['invalid date', { ...recentTrip, endDate: '2026-09-31' }, '$.endDate', 'invalid-date'],
    [
      'wrong currency',
      { ...recentTrip, price: { amount: 100, currency: 'USD' } },
      '$.price.currency',
      'invalid-money',
    ],
  ] as const)('rejects %s', (_name, payload, path, reason) => {
    expect(() => decodeTravelHistoryItemDto(payload)).toThrowError(
      expect.objectContaining({ path, reason }),
    );
  });

  it('reports the failing collection item path', () => {
    expect(() =>
      decodeTravelHistoryListDto([
        recentTrip,
        { ...recentTrip, reservationId: 802, tourProduct: { ...recentTrip.tourProduct, id: 0 } },
      ]),
    ).toThrowError(
      expect.objectContaining({
        contract: 'TravelHistory',
        path: '$[1].tourProduct.id',
        reason: 'expected-positive-integer',
      }),
    );
  });

  it('does not retain malformed History payload content', () => {
    const privateMarker = 'history-private-marker';

    try {
      decodeTravelHistoryItemDto({
        ...recentTrip,
        privateMarker,
        price: { amount: 'invalid', currency: 'KRW' },
      });
      throw new Error('Expected decode to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContractMappingError);
      expect(String(error)).not.toContain(privateMarker);
      expect(JSON.stringify(error)).not.toContain(privateMarker);
    }
  });
});
