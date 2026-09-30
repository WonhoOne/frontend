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
 * Owns shared route landmarks and Application chrome selection.
 *
 * CONTRACT: Route metadata chooses generic chrome. Full navigation focus
 * management remains PR-02 runtime work; Foundation only guarantees a stable
 * skip target and focusable main landmark.
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
