import { useAuth } from '@/features/auth';
import { PreviousTripsPopup } from '@/features/travel-history/PreviousTripsPopup';
import type { TravelHistoryDataSource } from '@/features/travel-history/TravelHistoryDataSource';
import {
  clearPostLoginHistoryIntent,
  usePostLoginHistoryIntent,
} from '@/features/travel-history/postLoginHistoryIntent';

interface PostLoginPreviousTripsSurfaceProps {
  dataSource: TravelHistoryDataSource;
  onExplore: () => void;
  onViewAll: () => void;
}

export function PostLoginPreviousTripsSurface({
  dataSource,
  onExplore,
  onViewAll,
}: PostLoginPreviousTripsSurfaceProps) {
  const auth = useAuth();
  const intent = usePostLoginHistoryIntent();
  const open = auth.state.status === 'authenticated' && intent === 'show-previous-trips';

  if (auth.state.status !== 'authenticated') {
    return null;
  }

  return (
    <PreviousTripsPopup
      dataSource={dataSource}
      onExplore={onExplore}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          clearPostLoginHistoryIntent();
        }
      }}
      onViewAll={onViewAll}
      open={open}
    />
  );
}
