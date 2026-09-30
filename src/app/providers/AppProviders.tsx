import type { PropsWithChildren } from 'react';

import { QueryProvider } from '@/app/providers/QueryProvider';
import { ReservationDraftProvider } from '@/features/reservation';

/**
 * 애플리케이션 전역 Provider 순서를 한 곳에서 드러낸다.
 *
 * ReservationDraftProvider는 Configure/Review/Auth interruption을 관통하는
 * transaction lifecycle 때문에 app composition에 위치한다.
 *
 * INVARIANT: 편의를 이유로 다른 Feature 로컬 상태를 이곳에 승격하지 않는다.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ReservationDraftProvider>{children}</ReservationDraftProvider>
    </QueryProvider>
  );
}
