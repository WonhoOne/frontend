import type {
  TourDetailDataSource,
  TourDetailReadOptions,
} from '@/features/tour-detail/TourDetailDataSource';
import { findTourDetailPreview } from '@/features/tour-detail/tourDetail.preview';
import { BackendHttpError } from '@/integrations/backend/client/backendHttpError';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export class MockTourDetailDataSource implements TourDetailDataSource {
  async getTourProduct(tourId: ResourceId, options: TourDetailReadOptions = {}) {
    if (options.signal?.aborted === true) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    const tour = findTourDetailPreview(tourId);

    if (tour === null) {
      throw new BackendHttpError(
        { status: 404, statusText: 'Not Found', headers: {} },
        { code: 'TOUR_PRODUCT_NOT_FOUND' },
      );
    }

    return tour;
  }
}
