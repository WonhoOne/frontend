import { createServer } from 'node:http';
import { URL } from 'node:url';

const host = '127.0.0.1';
const port = 8080;

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
    id: 102,
    theme: 'PARENTS_HEALING',
    name: 'Parents Healing · Journey 01',
    description: 'A curated journey shaped by the Parents Healing theme.',
    availableStyles: ['GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'GRAND', amount: 1600000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2200000, currency: 'KRW' },
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
  {
    id: 105,
    theme: 'OUTDOOR_TREKKING',
    name: 'Outdoor Trekking · Journey 01',
    description: 'A curated journey shaped by the Outdoor Trekking theme.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'CLASSIC', amount: 1100000, currency: 'KRW' },
      { style: 'GRAND', amount: 1700000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2300000, currency: 'KRW' },
    ],
  },
];

function schedulesFor(tourId) {
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

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === 'GET' && request.url === '/api/v1/tours') {
    response.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify(tourProducts));
    return;
  }

  if (request.method === 'GET' && request.url?.startsWith('/api/v1/tours/')) {
    const tourId = Number(request.url.slice('/api/v1/tours/'.length));
    const tour = tourProducts.find((product) => product.id === tourId);

    response.writeHead(tour === undefined ? 404 : 200, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(
      JSON.stringify(
        tour ?? {
          code: 'TOUR_PRODUCT_NOT_FOUND',
          message: 'Tour product not found.',
          fieldErrors: [],
        },
      ),
    );
    return;
  }

  if (request.method === 'GET' && request.url?.startsWith('/api/v1/tour-schedules')) {
    const url = new URL(request.url, `http://${host}:${port}`);
    const tourId = Number(url.searchParams.get('tourId'));

    response.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(
      JSON.stringify(Number.isSafeInteger(tourId) && tourId > 0 ? schedulesFor(tourId) : []),
    );
    return;
  }

  response.writeHead(404, {
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify({ code: 'NOT_FOUND' }));
});

server.listen(port, host);
