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

/**
 * Dynamic route parameter를 하나의 URL path segment로 안전하게 만든다.
 *
 * CONTRACT: Builder는 identifier의 형식이나 business 의미를 검증하지 않는다.
 * 호출자가 전달한 값을 URL segment로 encode하는 책임만 가진다.
 */
export const routeBuilders = {
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
