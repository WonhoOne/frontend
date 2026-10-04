import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import {
  shouldRetryTourDetail,
  toTourDetailCoreState,
  tourDetailQueryOptions,
  type TourDetailDataSource,
  type TourDetailModel,
} from '@/features/tour-detail';
import { BackendHttpError, BackendNetworkError } from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';

describe('Tour Detail query boundary', () => {
  it('forwards TanStack Query AbortSignal independently to the detail DataSource', async () => {
    let receivedSignal: AbortSignal | undefined;
    const tour: TourDetailModel = {
      id: 103,
      theme: 'GOLF_CHALLENGE',
      themeLabel: 'Golf Challenge',
      name: 'Golf',
      summary: 'Golf',
      storyTitle: 'Story',
      storyBody: 'Body',
      heroMedia: { imageSrc: null, imageAlt: '', fallbackLabel: 'Hero' },
      storyMedia: { imageSrc: null, imageAlt: '', fallbackLabel: 'Story' },
      includedExperiences: [],
      availableStyles: ['CLASSIC'],
      stylePrices: [{ style: 'CLASSIC', amount: 1000, currency: 'KRW' }],
    };
    const getTourProduct: TourDetailDataSource['getTourProduct'] = (_, options) => {
      receivedSignal = options?.signal;
      return Promise.resolve(tour);
    };
    const source: TourDetailDataSource = {
      getTourProduct: vi.fn(getTourProduct),
    };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await client.fetchQuery(tourDetailQueryOptions(source, 103));

    expect(receivedSignal).toBeInstanceOf(AbortSignal);
  });

  it('maps 404 to not-found without treating it as a retryable transport failure', () => {
    const error = new BackendHttpError(
      { status: 404, statusText: 'Not Found', headers: {} },
      { code: 'TOUR_PRODUCT_NOT_FOUND' },
    );

    expect(shouldRetryTourDetail(0, error)).toBe(false);
    expect(
      toTourDetailCoreState({
        data: undefined,
        error,
        isError: true,
        isFetching: false,
        isPending: false,
      }),
    ).toEqual({ status: 'not-found' });
  });

  it('retries network failures once but never retries contract mapping failures', () => {
    expect(shouldRetryTourDetail(0, new BackendNetworkError())).toBe(true);
    expect(shouldRetryTourDetail(1, new BackendNetworkError())).toBe(false);
    expect(
      shouldRetryTourDetail(
        0,
        new ContractMappingError('TourProduct', '$.theme', 'unknown-enum'),
      ),
    ).toBe(false);
  });
});
