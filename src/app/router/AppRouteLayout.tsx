import { Outlet, useMatches } from 'react-router';

import { GlobalHeader } from '@/app/shell/GlobalHeader';
import { TransactionHeader } from '@/app/shell/TransactionHeader';

export interface AppRouteHandle {
  chrome: 'global' | 'transaction';
  title: string;
}

function isAppRouteHandle(value: unknown): value is AppRouteHandle {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<AppRouteHandle>;

  return (
    (candidate.chrome === 'global' || candidate.chrome === 'transaction') &&
    typeof candidate.title === 'string'
  );
}

/**
 * 공통 route landmark와 Application chrome 선택을 소유한다.
 *
 * CONTRACT: generic chrome은 route metadata로 결정한다.
 * R0는 안정적인 skip target과 focus 가능한 main landmark를 유지한다.
 * route 전환 focus/scroll 정책은 R1에서 별도로 소유한다.
 */
export function AppRouteLayout() {
  const matches = useMatches();
  const routeHandle = [...matches]
    .reverse()
    .map((match) => match.handle)
    .find(isAppRouteHandle);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {routeHandle?.chrome === 'transaction' ? (
        <TransactionHeader title={routeHandle.title} />
      ) : (
        <GlobalHeader />
      )}

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
