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
