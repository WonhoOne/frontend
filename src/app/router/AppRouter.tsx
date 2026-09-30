import { createBrowserRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/routes';

const router = createBrowserRouter(appRoutes);

/**
 * Application Router boundary.
 *
 * CONTRACT: Server data remains owned by TanStack Query Feature layers. The
 * Foundation router contains no Backend loaders/actions.
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
