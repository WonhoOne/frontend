import type { RouteObject } from 'react-router';

import { AppRouteLayout, type AppRouteHandle } from '@/app/router/AppRouteLayout';
import { NotFound } from '@/app/router/NotFound';
import { routePaths, routePatterns } from '@/app/router/paths';
import { ConfigurePage } from '@/pages/configure/ConfigurePage';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/login/LoginPage';
import { MyTripsPage } from '@/pages/my-trips/MyTripsPage';
import { ReservationDetailPage } from '@/pages/reservation-detail/ReservationDetailPage';
import { ReservationReviewPage } from '@/pages/reservation-review/ReservationReviewPage';
import { ReservationSuccessPage } from '@/pages/reservation-success/ReservationSuccessPage';
import { SignupPage } from '@/pages/signup/SignupPage';
import { TourDetailPage } from '@/pages/tour-detail/TourDetailPage';
import { ToursPage } from '@/pages/tours/ToursPage';

function handle(chrome: AppRouteHandle['chrome'], title: string): AppRouteHandle {
  return { chrome, title };
}

/**
 * Customer route SSOT for the Foundation router.
 *
 * CONTRACT: These entries map approved route paths to Page composition only.
 * They do not contain loaders, Backend calls, Auth guards, or Product data.
 */
export const appRoutes: RouteObject[] = [
  {
    element: <AppRouteLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        handle: handle('global', 'Home'),
      },
      {
        path: routePaths.tours,
        element: <ToursPage />,
        handle: handle('global', 'Tours'),
      },
      {
        path: routePatterns.tourDetail,
        element: <TourDetailPage />,
        handle: handle('global', 'Tour Detail'),
      },
      {
        path: routePatterns.configure,
        element: <ConfigurePage />,
        handle: handle('transaction', 'Configure'),
      },
      {
        path: routePaths.reservationReview,
        element: <ReservationReviewPage />,
        handle: handle('transaction', 'Reservation Review'),
      },
      {
        path: routePatterns.reservationSuccess,
        element: <ReservationSuccessPage />,
        handle: handle('transaction', 'Reservation Success'),
      },
      {
        path: routePatterns.reservationDetail,
        element: <ReservationDetailPage />,
        handle: handle('transaction', 'Reservation Detail'),
      },
      {
        path: routePaths.login,
        element: <LoginPage />,
        handle: handle('global', 'Login'),
      },
      {
        path: routePaths.signup,
        element: <SignupPage />,
        handle: handle('global', 'Signup'),
      },
      {
        path: routePaths.myTrips,
        element: <MyTripsPage />,
        handle: handle('global', 'My Trips'),
      },
      {
        path: '*',
        element: <NotFound />,
        handle: handle('global', 'Not Found'),
      },
    ],
  },
];
