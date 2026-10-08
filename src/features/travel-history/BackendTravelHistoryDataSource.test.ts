import { describe, expect, it, vi } from 'vitest';

import { BackendTravelHistoryDataSource } from '@/features/travel-history/BackendTravelHistoryDataSource';
import { ContractMappingError } from '@/integrations/backend/contracts';

const first = {
  reservationId: 801,
  tourProduct: { id: 201, theme: 'GOLF_CHALLENGE', name: 'Synthetic Golf' },
  startDate: '2026-09-26',
  endDate: '2026-09-30',
  style: 'GRAND',
  price: { amount: 402000, currency: 'KRW' },
};

describe('BackendTravelHistoryDataSource', () => {
  it('uses the authenticated wire endpoint and preserves Backend array order and exact fields', async () => {
    const second = {
      ...first,
      reservationId: 700,
      tourProduct: { ...first.tourProduct, name: 'Older Golf' },
    };
    const requestJson = vi.fn().mockResolvedValue({
      body: [{ ...first, participantCount: 9 }, second],
    });
    const source = new BackendTravelHistoryDataSource({ requestJson });

    const items = await source.getTravelHistory();

    expect(requestJson).toHaveBeenCalledExactlyOnceWith({
      path: '/customers/me/travel-history',
      authentication: 'required',
    });
    expect(items).toEqual([first, second]);
    expect(items.map((item) => item.reservationId)).toEqual([801, 700]);
    expect(items[0]).not.toHaveProperty('participantCount');
  });

  it('accepts empty arrays without inventing history', async () => {
    const source = new BackendTravelHistoryDataSource({
      requestJson: vi.fn().mockResolvedValue({ body: [] }),
    });
    await expect(source.getTravelHistory()).resolves.toEqual([]);
  });

  it('rejects a malformed private response via the existing strict decoder', async () => {
    const source = new BackendTravelHistoryDataSource({
      requestJson: vi.fn().mockResolvedValue({ body: [{ ...first, reservationId: 0 }] }),
    });
    await expect(source.getTravelHistory()).rejects.toBeInstanceOf(ContractMappingError);
  });

  it('propagates private transport failures without falling back to a mock', async () => {
    const error = new Error('synthetic transport failure');
    const requestJson = vi.fn().mockRejectedValue(error);
    const source = new BackendTravelHistoryDataSource({ requestJson });
    await expect(source.getTravelHistory()).rejects.toBe(error);
    expect(requestJson).toHaveBeenCalledTimes(1);
  });
});
