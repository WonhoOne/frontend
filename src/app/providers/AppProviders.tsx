import type { PropsWithChildren } from 'react';

import { clearPrivateQueryCache } from '@/app/providers/privateQueryCache';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { queryClient } from '@/app/providers/queryClient';
import {
  AuthError,
  AuthProvider,
  MockAuthDataSource,
} from '@/features/auth';
import { ReservationDraftProvider } from '@/features/reservation';

const authDataSource = new MockAuthDataSource({
  async login() {
    throw new AuthError('LOGIN_FAILED');
  },
  async signup() {
    throw new AuthError('UNKNOWN');
  },
});

/**
 * 애플리케이션 전역 Provider 순서를 한 곳에서 드러낸다.
 *
 * AuthProvider는 private server-state lifecycle을 소유하므로 QueryProvider
 * 안쪽에 둔다. ReservationDraft는 auth loss에도 유지되어야 하므로 Auth의
 * private-cache clear 경계와 분리한다.
 *
 * INVARIANT: 편의를 이유로 다른 Feature 로컬 상태를 이곳에 승격하지 않는다.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider
        dataSource={authDataSource}
        onAuthLoss={() => clearPrivateQueryCache(queryClient)}
      >
        <ReservationDraftProvider>{children}</ReservationDraftProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
