import type { TourDetailModel } from '@/features/tour-detail/tourDetail.model';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export interface TourDetailReadOptions {
  signal?: AbortSignal;
}

export interface TourDetailDataSource {
  getTourProduct(
    tourId: ResourceId,
    options?: TourDetailReadOptions,
  ): Promise<TourDetailModel>;
}
