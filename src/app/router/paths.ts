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
