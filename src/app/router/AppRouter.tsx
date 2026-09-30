import { createBrowserRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/routes';

const router = createBrowserRouter(appRoutes);

/**
 * 애플리케이션 Router 경계다.
 *
 * CONTRACT: Server data는 TanStack Query 기반 Feature layer가 소유한다.
 * Foundation router에는 Backend loader/action을 넣지 않는다.
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
