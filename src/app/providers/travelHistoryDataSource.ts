import type { TravelHistoryDataSource } from '@/features/travel-history';

import { MockTravelHistoryDataSource } from '@/features/travel-history';

const unavailableTravelHistoryDataSource: TravelHistoryDataSource = {
  getTravelHistory() {
    return Promise.reject(new Error('Travel History data source is unavailable.'));
  },
};

function createTravelHistoryDataSource(): TravelHistoryDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockTravelHistoryDataSource({
      getTravelHistory() {
        return Promise.resolve([]);
      },
    });
  }

  return unavailableTravelHistoryDataSource;
}

export const travelHistoryDataSource = createTravelHistoryDataSource();
