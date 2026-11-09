import { useEffect } from 'react';

import { isCustomerSession, useAuth } from '@/features/auth';
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
  // SECURITY: 이전 여행 팝업은 고객 본인의 Travel History다. EMPLOYEE session에서는 열지 않는다.
  const customerSignedIn = isCustomerSession(auth.state);
  const open = customerSignedIn && intent === 'show-previous-trips';

  useEffect(() => {
    if (customerSignedIn && intent === 'suppress') {
      clearPostLoginHistoryIntent();
    }
  }, [customerSignedIn, intent]);

  if (!customerSignedIn) {
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
