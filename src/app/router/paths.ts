import { serializeResourceId, type ResourceId } from '@/shared/lib/resourceIdentity';

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
 * Dynamic Customer route를 일관된 URL로 만든다.
 *
 * CONTRACT: Builder는 identifier나 filter 값의 business 의미를 검증하지 않는다.
 * 호출자가 전달한 값을 URL-safe representation으로 만드는 책임만 가진다.
 */
export const routeBuilders = {
  toursByTheme(theme: string) {
    const search = new URLSearchParams({ theme });

    return `${routePaths.tours}?${search.toString()}`;
  },
  tourDetail(tourId: ResourceId) {
    return `/tours/${serializeResourceId(tourId)}`;
  },
  configure(tourId: ResourceId) {
    return `/tours/${serializeResourceId(tourId)}/configure`;
  },
  reservationSuccess(reservationId: string) {
    return `/reservation/${encodePathSegment(reservationId)}/success`;
  },
  reservationDetail(reservationId: string) {
    return `/reservations/${encodePathSegment(reservationId)}`;
  },
} as const;
