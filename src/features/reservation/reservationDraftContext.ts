import { createContext, type Dispatch, useContext } from 'react';

import type { ReservationDraftPersistenceStatus } from '@/features/reservation/reservationDraftPersistence';
import type { ReservationDraftAction } from '@/features/reservation/reservationDraftReducer';
import type { ReservationDraftV1 } from '@/features/reservation/ReservationDraft';

export interface ReservationDraftContextValue {
  draft: ReservationDraftV1;
  dispatch: Dispatch<ReservationDraftAction>;
  persistenceStatus: ReservationDraftPersistenceStatus;
}

export const ReservationDraftContext = createContext<ReservationDraftContextValue | null>(null);

export function useReservationDraft(): ReservationDraftContextValue {
  const value = useContext(ReservationDraftContext);

  if (value === null) {
    throw new Error('useReservationDraft must be used within ReservationDraftProvider');
  }

  return value;
}
