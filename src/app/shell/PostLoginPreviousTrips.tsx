import { useNavigate } from 'react-router';

import { travelHistoryDataSource } from '@/app/providers/travelHistoryDataSource';
import { routePaths } from '@/app/router/paths';
import { PostLoginPreviousTripsSurface } from '@/features/travel-history';

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
