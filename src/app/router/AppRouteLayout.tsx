import { useMatches } from 'react-router';

import { RouteMotionBoundary } from '@/app/router/RouteMotionBoundary';
import { RouteRuntime } from '@/app/router/RouteRuntime';
import { CustomerVoiceControl } from '@/app/shell/CustomerVoiceControl';
import { GlobalHeader } from '@/app/shell/GlobalHeader';
import { PostLoginPreviousTrips } from '@/app/shell/PostLoginPreviousTrips';
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
 * 안정적인 skip target과 focus 가능한 main landmark를 제공하고,
 * route 전환 focus/scroll lifecycle은 RouteRuntime에 위임하고,
 * route surface motion은 RouteMotionBoundary가 소유한다.
 */
export function AppRouteLayout() {
  const matches = useMatches();
  const routeHandle = [...matches]
    .reverse()
    .map((match) => match.handle)
    .find(isAppRouteHandle);

  return (
    <>
      <RouteRuntime />

      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {routeHandle?.chrome === 'transaction' ? (
        <TransactionHeader title={routeHandle.title} />
      ) : (
        <GlobalHeader />
      )}

      <PostLoginPreviousTrips />

      <main id="main-content" tabIndex={-1}>
        <RouteMotionBoundary />
        <CustomerVoiceControl />
      </main>
    </>
  );
}
