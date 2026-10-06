import { http, HttpResponse, type RequestHandler } from 'msw';

import {
  findPublicTourProductDtoFixture,
  getPublicTourScheduleDtoFixtures,
  publicTourProductDtoFixtures,
} from '@/mocks/publicReadFixtures';

/**
 * Shared test/development handlers for approved public v0.2 read contracts only.
 * Application mock runtime remains DEV + VITE_ENABLE_MOCKS=true opt-in.
 */
export const handlers: RequestHandler[] = [
  http.get('/api/v1/tours', () => HttpResponse.json(publicTourProductDtoFixtures)),
  http.get('/api/v1/tours/:tourId', ({ params }) => {
    const tourId = Number(params.tourId);
    const tour =
      Number.isSafeInteger(tourId) && tourId > 0 ? findPublicTourProductDtoFixture(tourId) : null;

    return tour === null
      ? HttpResponse.json(
          {
            code: 'TOUR_PRODUCT_NOT_FOUND',
            message: 'Tour product not found.',
            fieldErrors: [],
          },
          { status: 404 },
        )
      : HttpResponse.json(tour);
  }),
  http.get('/api/v1/tour-schedules', ({ request }) => {
    const tourId = Number(new URL(request.url).searchParams.get('tourId'));

    return HttpResponse.json(
      Number.isSafeInteger(tourId) && tourId > 0 ? getPublicTourScheduleDtoFixtures(tourId) : [],
    );
  }),
];
