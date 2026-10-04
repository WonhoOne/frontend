import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import {
  classifyTourDiscoveryError,
  shouldRetryTourDiscovery,
  toTourDiscoveryCollectionState,
  tourDiscoveryQueryOptions,
  type TourDiscoveryDataSource,
} from '@/features/tour-discovery';
import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';

const metadata = {
  status: 500,
  statusText: 'Server Error',
  headers: {},
};

describe('tour discovery query boundary', () => {
  it('forwards TanStack Query AbortSignal to the DataSource', async () => {
    const getTourProducts = vi.fn().mockResolvedValue([]);
    const source: TourDiscoveryDataSource = { getTourProducts };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await client.fetchQuery(tourDiscoveryQueryOptions(source));

    expect(getTourProducts).toHaveBeenCalledTimes(1);
    expect(getTourProducts.mock.calls[0]?.[0]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('does not retry contract, malformed-response, or 4xx failures as transient GET failures', () => {
    expect(
      shouldRetryTourDiscovery(0, new ContractMappingError('TourProduct[]', '$', 'expected-array')),
    ).toBe(false);
    expect(
      shouldRetryTourDiscovery(
        0,
        new BackendMalformedResponseError(metadata, 'invalid-json'),
      ),
    ).toBe(false);
    expect(
      shouldRetryTourDiscovery(
        0,
        new BackendHttpError({ ...metadata, status: 404 }, null),
      ),
    ).toBe(false);
    expect(shouldRetryTourDiscovery(0, new BackendNetworkError())).toBe(true);
    expect(shouldRetryTourDiscovery(1, new BackendNetworkError())).toBe(false);
  });

  it('maps transport and contract failures into the existing discovery error vocabulary', () => {
    expect(classifyTourDiscoveryError(new BackendNetworkError())).toBe('network');
    expect(classifyTourDiscoveryError(new BackendHttpError(metadata, null))).toBe('server');
    expect(
      classifyTourDiscoveryError(
        new ContractMappingError('TourProduct[]', '$', 'expected-array'),
      ),
    ).toBe('data-mismatch');
  });

  it('preserves successful data while a refresh is active or has failed', () => {
    const product = {
      id: 41,
      theme: 'GOLF_CHALLENGE' as const,
      name: 'Golf',
      description: 'Golf journey',
      availableStyles: ['CLASSIC'] as const,
      stylePrices: [{ style: 'CLASSIC' as const, amount: 1000, currency: 'KRW' as const }],
      media: { imageSrc: null, imageAlt: '', fallbackLabel: 'Golf' },
    };

    expect(
      toTourDiscoveryCollectionState({
        data: [product],
        error: null,
        isError: false,
        isFetching: true,
        isPending: false,
      }),
    ).toMatchObject({ status: 'ready', freshness: 'refreshing' });

    expect(
      toTourDiscoveryCollectionState({
        data: [product],
        error: new BackendNetworkError(),
        isError: true,
        isFetching: false,
        isPending: false,
      }),
    ).toMatchObject({ status: 'ready', freshness: 'stale' });
  });
});
