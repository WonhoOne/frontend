import { createServer } from 'node:http';

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
    description:
      'A second TourProduct in the same Theme, with its own detail identity.',
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

  response.writeHead(404, {
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify({ code: 'NOT_FOUND' }));
});

server.listen(port, host);

