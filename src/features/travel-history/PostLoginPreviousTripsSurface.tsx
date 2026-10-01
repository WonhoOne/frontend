import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth';
import { PreviousTripsPopup } from '@/features/travel-history/PreviousTripsPopup';
import type { TravelHistoryDataSource } from '@/features/travel-history/TravelHistoryDataSource';
import {
  consumePostLoginHistoryIntent,
  usePostLoginHistoryIntent,
} from '@/features/travel-history/postLoginHistoryIntent';

interface PostLoginPreviousTripsSurfaceProps {
  dataSource: TravelHistoryDataSource;
}

export function PostLoginPreviousTripsSurface({
  dataSource,
}: PostLoginPreviousTripsSurfaceProps) {
  const auth = useAuth();
  const intent = usePostLoginHistoryIntent();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (auth.state.status !== 'authenticated' || intent === null) {
      return;
    }

    const consumed = consumePostLoginHistoryIntent();
    setOpen(consumed === 'show-previous-trips');
  }, [auth.state.status, intent]);

  if (auth.state.status !== 'authenticated') {
    return null;
  }

  return <PreviousTripsPopup dataSource={dataSource} onOpenChange={setOpen} open={open} />;
}
