import type {
  TourDiscoveryDataSource,
  TourDiscoveryReadOptions,
} from '@/features/tour-discovery/TourDiscoveryDataSource';
import type { TourProductSummaryModel } from '@/features/tour-discovery/tourDiscovery.model';

export class MockTourDiscoveryDataSource implements TourDiscoveryDataSource {
  constructor(private readonly products: readonly TourProductSummaryModel[]) {}

  getTourProducts(options?: TourDiscoveryReadOptions) {
    if (options?.signal?.aborted === true) {
      return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
    }

    return Promise.resolve(this.products);
  }
}
