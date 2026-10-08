import type { TravelHistoryDataSource } from '@/features/travel-history/TravelHistoryDataSource';
import { adaptTravelHistoryListDto } from '@/features/travel-history/travelHistory.adapter';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { decodeTravelHistoryListDto } from '@/integrations/backend/contracts';

/** One protected read; no local completion rules, sorting or silent Mock fallback. */
export class BackendTravelHistoryDataSource implements TravelHistoryDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async getTravelHistory() {
    const response = await this.client.requestJson({
      path: '/customers/me/travel-history',
      authentication: 'required',
    });

    return adaptTravelHistoryListDto(decodeTravelHistoryListDto(response.body));
  }
}
