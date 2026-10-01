// @vitest-environment jsdom

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { clearPrivateQueryCache } from '@/app/providers/privateQueryCache';
import {
  travelHistoryQueryKey,
  travelHistoryQueryOptions,
  type TravelHistoryDataSource,
  type TravelHistoryItemModel,
  useTravelHistory,
} from '@/features/travel-history';

const firstHistory: readonly TravelHistoryItemModel[] = [
  {
    reservationId: 22,
    tourProduct: { id: 4, theme: 'OUTDOOR_TREKKING', name: 'Synthetic Trekking' },
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    style: 'GRAND',
    price: { amount: 1200000, currency: 'KRW' },
  },
];

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('travelHistory query boundary', () => {
  it('uses one stable key and marks the query private at its owner', async () => {
    const source: TravelHistoryDataSource = {
      getTravelHistory: vi.fn().mockResolvedValue(firstHistory),
    };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await client.prefetchQuery(travelHistoryQueryOptions(source));

    expect(client.getQueryData(travelHistoryQueryKey)).toBe(firstHistory);
    expect(client.getQueryCache().find({ queryKey: travelHistoryQueryKey })?.meta).toEqual({
      privacy: 'private',
    });
  });

  it('deduplicates simultaneous Popup/My Trips consumers through the shared key', async () => {
    let resolveHistory!: (value: readonly TravelHistoryItemModel[]) => void;
    const request = new Promise<readonly TravelHistoryItemModel[]>((resolve) => {
      resolveHistory = resolve;
    });
    const getTravelHistory = vi.fn().mockReturnValue(request);
    const source: TravelHistoryDataSource = { getTravelHistory };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = createWrapper(client);

    const popup = renderHook(() => useTravelHistory(source), { wrapper });
    const myTrips = renderHook(() => useTravelHistory(source), { wrapper });

    expect(getTravelHistory).toHaveBeenCalledTimes(1);

    await act(async () => resolveHistory(firstHistory));

    await waitFor(() => expect(popup.result.current.data).toBe(firstHistory));
    expect(myTrips.result.current.data).toBe(firstHistory);
    expect(getTravelHistory).toHaveBeenCalledTimes(1);
  });

  it('preserves successful cached content while a refresh fails', async () => {
    const getTravelHistory = vi
      .fn()
      .mockResolvedValueOnce(firstHistory)
      .mockRejectedValueOnce(new Error('synthetic refresh failure'));
    const source: TravelHistoryDataSource = { getTravelHistory };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = createWrapper(client);
    const { result } = renderHook(() => useTravelHistory(source), { wrapper });

    await waitFor(() => expect(result.current.data).toBe(firstHistory));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe(firstHistory);
    expect(result.current.isError).toBe(true);
  });

  it('is removed by auth private-cache clearing without touching public data', async () => {
    const source: TravelHistoryDataSource = {
      getTravelHistory: vi.fn().mockResolvedValue(firstHistory),
    };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await client.prefetchQuery(travelHistoryQueryOptions(source));
    client.setQueryData(['public-tour'], { id: 'tour-1' });

    clearPrivateQueryCache(client);

    expect(client.getQueryData(travelHistoryQueryKey)).toBeUndefined();
    expect(client.getQueryData(['public-tour'])).toEqual({ id: 'tour-1' });
  });

  it('keeps the cache memory-only by relying solely on the QueryClient runtime', async () => {
    const source: TravelHistoryDataSource = {
      getTravelHistory: vi.fn().mockResolvedValue(firstHistory),
    };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const storageSet = vi.spyOn(Storage.prototype, 'setItem');

    await client.prefetchQuery(travelHistoryQueryOptions(source));

    expect(storageSet).not.toHaveBeenCalled();
    storageSet.mockRestore();
  });
});
