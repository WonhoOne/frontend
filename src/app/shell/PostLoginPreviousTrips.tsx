import { useNavigate } from 'react-router';

import { routePaths } from '@/app/router/paths';
import {
  MockTravelHistoryDataSource,
  PostLoginPreviousTripsSurface,
  type TravelHistoryDataSource,
} from '@/features/travel-history';

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

const travelHistoryDataSource = createTravelHistoryDataSource();

export function PostLoginPreviousTrips() {
  const navigate = useNavigate();

  return (
    <PostLoginPreviousTripsSurface
      dataSource={travelHistoryDataSource}
      onExplore={() => void navigate(routePaths.tours)}
      onViewAll={() => void navigate(routePaths.myTrips)}
    />
  );
}
