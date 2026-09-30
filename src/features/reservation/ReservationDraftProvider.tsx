import {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  ReservationDraftContext,
  type ReservationDraftContextValue,
} from '@/features/reservation/reservationDraftContext';
import {
  hydrateReservationDraft,
  persistReservationDraft,
  resolveBrowserSessionStorage,
  type ReservationDraftPersistenceStatus,
  type ReservationDraftStorage,
} from '@/features/reservation/reservationDraftPersistence';
import { reservationDraftReducer } from '@/features/reservation/reservationDraftReducer';

interface ReservationDraftProviderProps extends PropsWithChildren {
  storage?: ReservationDraftStorage | null;
  now?: () => number;
}

interface PersistenceStatusStore {
  getSnapshot: () => ReservationDraftPersistenceStatus;
  subscribe: (listener: () => void) => () => void;
  update: (status: ReservationDraftPersistenceStatus) => void;
}

function createPersistenceStatusStore(
  initialStatus: ReservationDraftPersistenceStatus,
): PersistenceStatusStore {
  let status = initialStatus;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => status,
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    update(nextStatus) {
      if (status === nextStatus) {
        return;
      }

      status = nextStatus;
      listeners.forEach((listener) => listener());
    },
  };
}

/**
 * Configure → Review → later Auth interruption을 관통하는 Frontend transaction state provider.
 *
 * Persistence:
 * - sessionStorage에서 V1 Draft를 1회 rehydrate한다.
 * - 이후 transaction intent 변경을 같은 tab의 sessionStorage에 반영한다.
 * - storage 실패 시에도 reducer의 in-memory state는 유지한다.
 *
 * Does not:
 * - Server State/TanStack Query data를 소유하지 않음
 * - Backend DTO 또는 customer credential을 저장하지 않음
 * - Reservation submit/network lifecycle을 수행하지 않음
 */
export function ReservationDraftProvider({
  children,
  storage = resolveBrowserSessionStorage(),
  now = Date.now,
}: ReservationDraftProviderProps) {
  const [hydration] = useState(() => hydrateReservationDraft(storage, now()));
  const [draft, dispatch] = useReducer(reservationDraftReducer, hydration.draft);
  const [persistenceStore] = useState(() =>
    createPersistenceStatusStore(hydration.persistenceStatus),
  );
  const persistenceStatus = useSyncExternalStore(
    persistenceStore.subscribe,
    persistenceStore.getSnapshot,
    persistenceStore.getSnapshot,
  );

  useEffect(() => {
    persistenceStore.update(persistReservationDraft(storage, draft));
  }, [draft, persistenceStore, storage]);

  const value = useMemo<ReservationDraftContextValue>(
    () => ({
      draft,
      dispatch,
      hydrationStatus: hydration.hydrationStatus,
      persistenceStatus,
    }),
    [draft, hydration.hydrationStatus, persistenceStatus],
  );

  return (
    <ReservationDraftContext.Provider value={value}>{children}</ReservationDraftContext.Provider>
  );
}
