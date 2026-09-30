import type { PropsWithChildren } from 'react';

import { QueryProvider } from '@/app/providers/QueryProvider';

/**
 * 애플리케이션 전역 Provider 순서를 한 곳에서 드러낸다.
 *
 * INVARIANT: 편의를 이유로 Feature 로컬 상태를 이곳에 승격하지 않는다.
 * 새 Provider는 애플리케이션 전체 lifecycle 근거가 있을 때만 추가한다.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return <QueryProvider>{children}</QueryProvider>;
}
