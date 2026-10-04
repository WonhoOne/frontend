import { http, HttpResponse, type RequestHandler } from 'msw';

const tourProducts = [
  {
    id: 101,
    theme: 'HONEYMOON_ROMANCE',
    name: 'Honeymoon Romance · Journey 01',
    description: 'A curated journey shaped by the Honeymoon Romance theme.',
    availableStyles: ['GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'GRAND', amount: 1800000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2400000, currency: 'KRW' },
    ],
  },
  {
    id: 103,
    theme: 'GOLF_CHALLENGE',
    name: 'Golf Challenge · Journey 01',
    description: 'A curated journey shaped by the Golf Challenge theme.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
      { style: 'GRAND', amount: 1800000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2500000, currency: 'KRW' },
    ],
  },
  {
    id: 104,
    theme: 'GOLF_CHALLENGE',
    name: 'Golf Challenge · Journey 02',
    description: 'A second TourProduct in the same Theme, with its own detail identity.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'CLASSIC', amount: 1300000, currency: 'KRW' },
      { style: 'GRAND', amount: 1900000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2600000, currency: 'KRW' },
    ],
  },
];

function schedulesFor(tourId: number) {
  const coupleTeam = tourId === 101;

  return [
    {
      id: tourId * 10 + 1,
      tourId,
      startDate: '2027-03-10',
      endDate: '2027-03-14',
      reservable: true,
      recruitment: {
        unit: coupleTeam ? 'COUPLE_TEAM' : 'PARTICIPANT',
        currentCount: coupleTeam ? 1 : 2,
        requiredCount: coupleTeam ? 2 : 3,
        confirmed: false,
      },
    },
    {
      id: tourId * 10 + 2,
      tourId,
      startDate: '2027-04-10',
      endDate: '2027-04-14',
      reservable: false,
      recruitment: {
        unit: coupleTeam ? 'COUPLE_TEAM' : 'PARTICIPANT',
        currentCount: coupleTeam ? 2 : 3,
        requiredCount: coupleTeam ? 2 : 3,
        confirmed: true,
      },
    },
  ];
}

/**
 * Shared test/development handlers for approved public v0.2 read contracts only.
 * Application mock runtime remains DEV + VITE_ENABLE_MOCKS=true opt-in.
 */
export const handlers: RequestHandler[] = [
  http.get('/api/v1/tours', () => HttpResponse.json(tourProducts)),
  http.get('/api/v1/tours/:tourId', ({ params }) => {
    const tourId = Number(params.tourId);
    const tour = tourProducts.find((product) => product.id === tourId);

    return tour === undefined
      ? HttpResponse.json(
          { code: 'TOUR_PRODUCT_NOT_FOUND', message: 'Tour product not found.', fieldErrors: [] },
          { status: 404 },
        )
      : HttpResponse.json(tour);
  }),
  http.get('/api/v1/tour-schedules', ({ request }) => {
    const tourId = Number(new URL(request.url).searchParams.get('tourId'));

    return HttpResponse.json(
      Number.isSafeInteger(tourId) && tourId > 0 ? schedulesFor(tourId) : [],
    );
  }),
];
