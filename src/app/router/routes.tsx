import { lazy, Suspense, type ComponentType } from 'react';
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
import { EmployeeNotFound } from '@/pages/employee-status/EmployeeNotFound';
import { HomePage } from '@/pages/home/HomePage';

function handle(chrome: AppRouteHandle['chrome'], title: string): AppRouteHandle {
  return { chrome, title };
}

/**
 * Page 단위 code splitting (Master Plan §44, Completion Plan D-A4).
 *
 * WHY: 모든 Page를 한 bundle에 넣으면 첫 화면이 쓰지 않는 Configure, Reservation,
 * Employee Console 코드까지 내려받는다. Page는 route에 들어갈 때 불러온다.
 * Home은 첫 진입 화면(LCP)이라 즉시 불러온다.
 *
 * CONTRACT: Router의 route-level `lazy`는 첫 진입 때 layout과 header까지 함께 늦추므로
 * 쓰지 않는다. Layout은 바로 그리고 Page 영역만 `React.lazy` + `Suspense`로 늦춘다.
 * Router navigation은 transition으로 처리되어 이동 중에는 이전 Page가 유지된다.
 * `handle`(chrome metadata)은 정적으로 둔다.
 */
function lazyPage<Module>(load: () => Promise<Module>, pick: (module: Module) => ComponentType) {
  const LazyPage = lazy(async () => ({ default: pick(await load()) }));

  return (
    <Suspense fallback={null}>
      <LazyPage />
    </Suspense>
  );
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
      {
        path: employeeRoutePaths.login,
        element: lazyPage(
          () => import('@/pages/employee-login/EmployeeLoginPage'),
          (module) => module.EmployeeLoginPage,
        ),
      },
      {
        element: <EmployeeAccessBoundary />,
        children: [
          {
            path: employeeRoutePaths.tours,
            element: lazyPage(
              () => import('@/pages/employee-tours/EmployeeToursPage'),
              (module) => module.EmployeeToursPage,
            ),
          },
          {
            path: employeeRoutePaths.tourCreate,
            element: lazyPage(
              () => import('@/pages/employee-tour-create/EmployeeTourCreatePage'),
              (module) => module.EmployeeTourCreatePage,
            ),
          },
          {
            path: employeeRoutePatterns.tourEdit,
            element: lazyPage(
              () => import('@/pages/employee-tour-edit/EmployeeTourEditPage'),
              (module) => module.EmployeeTourEditPage,
            ),
          },
          {
            path: employeeRoutePaths.inventory,
            element: lazyPage(
              () => import('@/pages/employee-inventory/EmployeeInventoryPage'),
              (module) => module.EmployeeInventoryPage,
            ),
          },
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
        element: lazyPage(
          () => import('@/pages/tours/ToursPage'),
          (module) => module.ToursPage,
        ),
        handle: handle('global', routeTitles.tours),
      },
      {
        path: routePatterns.tourDetail,
        element: lazyPage(
          () => import('@/pages/tour-detail/TourDetailPage'),
          (module) => module.TourDetailPage,
        ),
        handle: handle('global', routeTitles.tourDetail),
      },
      {
        path: routePatterns.configure,
        element: lazyPage(
          () => import('@/pages/configure/ConfigurePage'),
          (module) => module.ConfigurePage,
        ),
        handle: handle('transaction', routeTitles.configure),
      },
      {
        path: routePaths.reservationReview,
        element: lazyPage(
          () => import('@/pages/reservation-review/ReservationReviewPage'),
          (module) => module.ReservationReviewPage,
        ),
        handle: handle('transaction', routeTitles.reservationReview),
      },
      {
        path: routePatterns.reservationSuccess,
        element: lazyPage(
          () => import('@/pages/reservation-success/ReservationSuccessPage'),
          (module) => module.ReservationSuccessPage,
        ),
        handle: handle('transaction', routeTitles.reservationSuccess),
      },
      {
        path: routePatterns.reservationDetail,
        element: lazyPage(
          () => import('@/pages/reservation-detail/ReservationDetailPage'),
          (module) => module.ReservationDetailPage,
        ),
        handle: handle('transaction', routeTitles.reservationDetail),
      },
      {
        path: routePaths.login,
        element: lazyPage(
          () => import('@/pages/login/LoginPage'),
          (module) => module.LoginPage,
        ),
        handle: handle('global', routeTitles.login),
      },
      {
        path: routePaths.signup,
        element: lazyPage(
          () => import('@/pages/signup/SignupPage'),
          (module) => module.SignupPage,
        ),
        handle: handle('global', routeTitles.signup),
      },
      {
        path: routePaths.myTrips,
        element: lazyPage(
          () => import('@/pages/my-trips/MyTripsPage'),
          (module) => module.MyTripsPage,
        ),
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
