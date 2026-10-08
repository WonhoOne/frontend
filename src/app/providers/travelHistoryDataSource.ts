import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendTravelHistoryDataSource,
  MockTravelHistoryDataSource,
  type TravelHistoryDataSource,
} from '@/features/travel-history';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';

export interface TravelHistoryCompositionEnvironment {
  DEV: boolean;
  VITE_ENABLE_MOCKS?: string;
}

export interface TravelHistoryCompositionOptions {
  client?: Pick<BackendHttpClient, 'requestJson'>;
  environment?: TravelHistoryCompositionEnvironment;
}

/** Normal development and production always use the authenticated Backend. */
export function createTravelHistoryDataSource(
  options: TravelHistoryCompositionOptions = {},
): TravelHistoryDataSource {
  const environment = options.environment ?? import.meta.env;
  const client = options.client ?? backendHttpClient;

  if (environment.DEV && environment.VITE_ENABLE_MOCKS === 'true') {
    return new MockTravelHistoryDataSource({
      getTravelHistory() {
        return Promise.resolve([]);
      },
    });
  }

  return new BackendTravelHistoryDataSource(client);
}

export const travelHistoryDataSource = createTravelHistoryDataSource();
