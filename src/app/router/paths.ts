export const routePaths = {
  home: '/',
  tours: '/tours',
  reservationReview: '/reservation/review',
  login: '/login',
  signup: '/signup',
  myTrips: '/my-trips',
} as const;

export const routePatterns = {
  tourDetail: '/tours/:tourId',
  configure: '/tours/:tourId/configure',
  reservationSuccess: '/reservation/:reservationId/success',
  reservationDetail: '/reservations/:reservationId',
} as const;

export const routeTitles = {
  home: 'Home',
  tours: 'Tours',
  tourDetail: 'Tour Detail',
  configure: 'Configure',
  reservationReview: 'Reservation Review',
  reservationSuccess: 'Reservation Success',
  reservationDetail: 'Reservation Detail',
  login: 'Login',
  signup: 'Signup',
  myTrips: 'My Trips',
  notFound: 'Page not found',
} as const;

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

export const routeBuilders = {
  toursByTheme(theme: string) {
    const search = new URLSearchParams({ theme });
    return `${routePaths.tours}?${search.toString()}`;
  },
  tourDetail(tourId: string) {
    return `/tours/${encodePathSegment(tourId)}`;
  },
  configure(tourId: string) {
    return `/tours/${encodePathSegment(tourId)}/configure`;
  },
  reservationSuccess(reservationId: string) {
    return `/reservation/${encodePathSegment(reservationId)}/success`;
  },
  reservationDetail(reservationId: string) {
    return `/reservations/${encodePathSegment(reservationId)}`;
  },
} as const;

/**
 * Employee Console route 정의다 (CP1-B IA-01/IA-04/IA-05 승인 경로).
 *
 * CONTRACT: Frontend client route일 뿐 Backend endpoint가 아니다.
 * 접근 권한의 최종 판단은 Backend의 EMPLOYEE role 검사가 한다.
 */
export const employeeRoutePaths = {
  root: '/employee',
  login: '/employee/login',
  tours: '/employee/tours',
  tourCreate: '/employee/tours/new',
  inventory: '/employee/inventory',
} as const;

export const employeeRoutePatterns = {
  tourEdit: '/employee/tours/:tourId/edit',
} as const;

export const employeeRouteBuilders = {
  tourEdit(tourId: string) {
    return `/employee/tours/${encodePathSegment(tourId)}/edit`;
  },
  login(returnTo: string | null) {
    if (returnTo === null) {
      return employeeRoutePaths.login;
    }

    return `${employeeRoutePaths.login}?${new URLSearchParams({ returnTo }).toString()}`;
  },
} as const;
