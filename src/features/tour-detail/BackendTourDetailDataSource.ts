import type {
  TourDetailDataSource,
  TourDetailReadOptions,
} from '@/features/tour-detail/TourDetailDataSource';
import { adaptTourProductDetailDto } from '@/features/tour-detail/tourDetail.adapter';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { decodeTourProductDto } from '@/integrations/backend/contracts';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export class BackendTourDetailDataSource implements TourDetailDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async getTourProduct(tourId: ResourceId, options: TourDetailReadOptions = {}) {
    const response = await this.client.requestJson({
      path: `/tours/${tourId}`,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    });

    return adaptTourProductDetailDto(decodeTourProductDto(response.body));
  }
}
