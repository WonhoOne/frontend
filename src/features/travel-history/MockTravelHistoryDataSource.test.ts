import { describe, expect, it, vi } from 'vitest';

import {
  MockTravelHistoryDataSource,
  type TravelHistoryItemModel,
} from '@/features/travel-history';

const backendOrderedHistory: readonly TravelHistoryItemModel[] = [
  {
    reservationId: 22,
    tourProduct: {
      id: 4,
      theme: 'OUTDOOR_TREKKING',
      name: 'Synthetic Trekking',
    },
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    style: 'GRAND',
    price: { amount: 1200000, currency: 'KRW' },
  },
  {
    reservationId: 11,
    tourProduct: {
      id: 2,
      theme: 'GOLF_CHALLENGE',
      name: 'Synthetic Golf',
    },
    startDate: '2026-05-01',
    endDate: '2026-05-03',
    style: 'CLASSIC',
    price: { amount: 900000, currency: 'KRW' },
  },
];

describe('MockTravelHistoryDataSource', () => {
  it('returns the injected v0.2 history list without frontend sorting or enrichment', async () => {
    const getTravelHistory = vi.fn().mockResolvedValue(backendOrderedHistory);
    const source = new MockTravelHistoryDataSource({ getTravelHistory });

    const result = await source.getTravelHistory();

    expect(result).toBe(backendOrderedHistory);
    expect(result.map((item) => item.reservationId)).toEqual([22, 11]);
    expect(getTravelHistory).toHaveBeenCalledTimes(1);
  });

  it('does not require fields that v0.2 does not expose', async () => {
    const source = new MockTravelHistoryDataSource({
      getTravelHistory: vi.fn().mockResolvedValue([backendOrderedHistory[0]]),
    });

    const [item] = await source.getTravelHistory();

    expect(item).toEqual({
      reservationId: 22,
      tourProduct: {
        id: 4,
        theme: 'OUTDOOR_TREKKING',
        name: 'Synthetic Trekking',
      },
      startDate: '2026-08-10',
      endDate: '2026-08-12',
      style: 'GRAND',
      price: { amount: 1200000, currency: 'KRW' },
    });
    expect(item).not.toHaveProperty('image');
    expect(item).not.toHaveProperty('options');
    expect(item).not.toHaveProperty('participantCount');
    expect(item).not.toHaveProperty('status');
  });

  it('preserves empty history as a valid plain-array result', async () => {
    const source = new MockTravelHistoryDataSource({
      getTravelHistory: vi.fn().mockResolvedValue([]),
    });

    await expect(source.getTravelHistory()).resolves.toEqual([]);
  });

  it('propagates source failure for the query layer to normalize in E09', async () => {
    const failure = new Error('synthetic history failure');
    const source = new MockTravelHistoryDataSource({
      getTravelHistory: vi.fn().mockRejectedValue(failure),
    });

    await expect(source.getTravelHistory()).rejects.toBe(failure);
  });
});
