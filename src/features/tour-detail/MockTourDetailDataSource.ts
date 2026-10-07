import type {
  TourDetailDataSource,
  TourDetailReadOptions,
} from '@/features/tour-detail/TourDetailDataSource';
import { adaptTourProductDetailDto } from '@/features/tour-detail/tourDetail.adapter';
import {
  BackendHttpError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import {
  findPublicTourProductDtoFixture,
  PUBLIC_READ_MOCK_ONLY_SENTINEL,
} from '@/mocks/publicReadFixtures';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export class MockTourDetailDataSource implements TourDetailDataSource {
  readonly mockRuntimeSentinel = PUBLIC_READ_MOCK_ONLY_SENTINEL;

  getTourProduct(tourId: ResourceId, options: TourDetailReadOptions = {}) {
    if (options.signal?.aborted === true) {
      return Promise.reject(new BackendRequestAbortedError());
    }

    const product = findPublicTourProductDtoFixture(tourId);

    if (product === null) {
      return Promise.reject(
        new BackendHttpError(
          { status: 404, statusText: 'Not Found', headers: {} },
          {
            code: 'TOUR_PRODUCT_NOT_FOUND',
            message: 'Tour product not found.',
            fieldErrors: [],
          },
        ),
      );
    }

    return Promise.resolve(adaptTourProductDetailDto(product));
  }
}
