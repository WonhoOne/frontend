import { ScrollRestoration } from 'react-router';

import { RouteFocusManager } from '@/app/router/RouteFocusManager';

/**
 * Router 전체에서 한 번만 존재하는 focus/scroll runtime이다.
 *
 * CONTRACT: Focus는 RouteFocusManager가 맡고 scroll history는 React Router의
 * location-key 기반 ScrollRestoration이 맡는다. Product state는 다루지 않는다.
 */
export function RouteRuntime() {
  return (
    <>
      <RouteFocusManager />
      <ScrollRestoration />
    </>
  );
}
