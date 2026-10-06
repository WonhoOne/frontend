import type {
  TourDiscoveryDataSource,
  TourDiscoveryReadOptions,
} from '@/features/tour-discovery/TourDiscoveryDataSource';
import { adaptTourProductDto } from '@/features/tour-discovery/tourProduct.adapter';
import { BackendRequestAbortedError } from '@/integrations/backend/client/backendHttpError';
import {
  PUBLIC_READ_MOCK_ONLY_SENTINEL,
  publicTourProductDtoFixtures,
} from '@/mocks/publicReadFixtures';

export class MockTourDiscoveryDataSource implements TourDiscoveryDataSource {
  readonly mockRuntimeSentinel = PUBLIC_READ_MOCK_ONLY_SENTINEL;

  getTourProducts(options?: TourDiscoveryReadOptions) {
    if (options?.signal?.aborted === true) {
      return Promise.reject(new BackendRequestAbortedError());
    }

    return Promise.resolve(publicTourProductDtoFixtures.map(adaptTourProductDto));
  }
}
