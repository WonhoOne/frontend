import type { TourProductSummaryModel } from '@/features/tour-discovery/tourDiscovery.model';

export interface TourDiscoveryReadOptions {
  signal?: AbortSignal;
}

export interface TourDiscoveryDataSource {
  getTourProducts(options?: TourDiscoveryReadOptions): Promise<readonly TourProductSummaryModel[]>;
}
