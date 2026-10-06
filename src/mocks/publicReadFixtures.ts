import type {
  TourProductDto,
  TourScheduleDto,
} from '@/integrations/backend/contracts';

export const PUBLIC_READ_MOCK_ONLY_SENTINEL = '__F1_PUBLIC_READ_MOCK_ONLY__';

export const publicTourProductDtoFixtures = [
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
] as const satisfies readonly TourProductDto[];

const scheduleBaseIdByTourId: Readonly<Record<number, number>> = {
  101: 1100,
  102: 1200,
  103: 1300,
  104: 1400,
  105: 1500,
};

function buildSchedules(tourId: number): readonly TourScheduleDto[] {
  const baseId = scheduleBaseIdByTourId[tourId];
  if (baseId === undefined) return [];

  const coupleTeam = tourId === 101;

  return [
    {
      id: baseId + 1,
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
      id: baseId + 2,
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

export function findPublicTourProductDtoFixture(tourId: number) {
  return publicTourProductDtoFixtures.find((product) => product.id === tourId) ?? null;
}

export function getPublicTourScheduleDtoFixtures(tourId: number) {
  return buildSchedules(tourId);
}
