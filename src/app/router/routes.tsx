import { Navigate, type RouteObject } from 'react-router';

import { AppRouteLayout, type AppRouteHandle } from '@/app/router/AppRouteLayout';
import { EmployeeAccessBoundary } from '@/app/router/EmployeeAccessBoundary';
import { EmployeeRouteLayout } from '@/app/router/EmployeeRouteLayout';
import { NotFound } from '@/app/router/NotFound';
import {
  employeeRoutePaths,
  employeeRoutePatterns,
  routePaths,
  routePatterns,
  routeTitles,
} from '@/app/router/paths';
import { ConfigurePage } from '@/pages/configure/ConfigurePage';
import { EmployeeInventoryPage } from '@/pages/employee-inventory/EmployeeInventoryPage';
import { EmployeeLoginPage } from '@/pages/employee-login/EmployeeLoginPage';
import { EmployeeNotFound } from '@/pages/employee-status/EmployeeNotFound';
import { EmployeeTourCreatePage } from '@/pages/employee-tour-create/EmployeeTourCreatePage';
import { EmployeeTourEditPage } from '@/pages/employee-tour-edit/EmployeeTourEditPage';
import { EmployeeToursPage } from '@/pages/employee-tours/EmployeeToursPage';
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
 * Customer route table과 route-level chrome metadata, 그리고 Employee route table의
 * 단일 정의 지점이다.
 *
 * CONTRACT: 승인된 route path와 Page 조합만 정의한다.
 * loader, Backend 호출, Auth guard, Product data는 포함하지 않는다.
 */
export const appRoutes: RouteObject[] = [
  {
    // CONTRACT: Employee 영역은 Customer layout의 형제다. Customer `*`가
    // `/employee/*`를 가로채지 않도록 path로 먼저 분기한다 (CP7 A-1).
    path: employeeRoutePaths.root,
    element: <EmployeeRouteLayout />,
    children: [
      { index: true, element: <Navigate replace to={employeeRoutePaths.tours} /> },
      { path: employeeRoutePaths.login, element: <EmployeeLoginPage /> },
      {
        element: <EmployeeAccessBoundary />,
        children: [
          { path: employeeRoutePaths.tours, element: <EmployeeToursPage /> },
          { path: employeeRoutePaths.tourCreate, element: <EmployeeTourCreatePage /> },
          { path: employeeRoutePatterns.tourEdit, element: <EmployeeTourEditPage /> },
          { path: employeeRoutePaths.inventory, element: <EmployeeInventoryPage /> },
          { path: '*', element: <EmployeeNotFound /> },
        ],
      },
    ],
  },
  {
    element: <AppRouteLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        handle: handle('global', routeTitles.home),
      },
      {
        path: routePaths.tours,
        element: <ToursPage />,
        handle: handle('global', routeTitles.tours),
      },
      {
        path: routePatterns.tourDetail,
        element: <TourDetailPage />,
        handle: handle('global', routeTitles.tourDetail),
      },
      {
        path: routePatterns.configure,
        element: <ConfigurePage />,
        handle: handle('transaction', routeTitles.configure),
      },
      {
        path: routePaths.reservationReview,
        element: <ReservationReviewPage />,
        handle: handle('transaction', routeTitles.reservationReview),
      },
      {
        path: routePatterns.reservationSuccess,
        element: <ReservationSuccessPage />,
        handle: handle('transaction', routeTitles.reservationSuccess),
      },
      {
        path: routePatterns.reservationDetail,
        element: <ReservationDetailPage />,
        handle: handle('transaction', routeTitles.reservationDetail),
      },
      {
        path: routePaths.login,
        element: <LoginPage />,
        handle: handle('global', routeTitles.login),
      },
      {
        path: routePaths.signup,
        element: <SignupPage />,
        handle: handle('global', routeTitles.signup),
      },
      {
        path: routePaths.myTrips,
        element: <MyTripsPage />,
        handle: handle('global', routeTitles.myTrips),
      },
      {
        path: '*',
        element: <NotFound />,
        handle: handle('global', routeTitles.notFound),
      },
    ],
  },
];
