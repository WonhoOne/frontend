import type {
  TourDiscoveryDataSource,
  TourDiscoveryReadOptions,
} from '@/features/tour-discovery/TourDiscoveryDataSource';
import { adaptTourProductDto } from '@/features/tour-discovery/tourProduct.adapter';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { decodeTourProductListDto } from '@/integrations/backend/contracts';

export class BackendTourDiscoveryDataSource implements TourDiscoveryDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async getTourProducts(options: TourDiscoveryReadOptions = {}) {
    const response = await this.client.requestJson({
      path: '/tours',
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    });

    return decodeTourProductListDto(response.body).map(adaptTourProductDto);
  }
}
