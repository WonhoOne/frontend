import type {
  TourDiscoveryCollectionState,
  TourProductSummaryModel,
} from '@/features/tour-discovery/tourDiscovery.model';

/**
 * IMP-2 Discovery UI를 위한 Frontend presentation preview catalog다.
 *
 * MOCK CONTRACT:
 * - Backend DTO가 아니며 API v0.2 field shape를 주장하지 않는다.
 * - 실제 destination / schedule / price / hotel 이름을 만들지 않는다.
 * - 같은 Theme에 여러 TourProduct를 포함해 Theme 1:N을 runtime UI에서도 검증한다.
 *
 * LIFECYCLE: IMP-6C에서 approved TourProduct adapter/data source가 연결되면
 * Page composition은 이 preview source 대신 live Frontend Model source를 받는다.
 */
export const tourDiscoveryPreviewProducts = [
  {
    id: '101',
    theme: 'HONEYMOON_ROMANCE',
    name: 'Honeymoon Romance · Journey 01',
    description: 'A curated journey shaped by the Honeymoon Romance theme.',
    availableStyles: ['GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'GRAND', amount: 1800000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2400000, currency: 'KRW' },
    ],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Honeymoon Romance journey',
    },
  },
  {
    id: '102',
    theme: 'PARENTS_HEALING',
    name: 'Parents Healing · Journey 01',
    description: 'A curated journey shaped by the Parents Healing theme.',
    availableStyles: ['GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'GRAND', amount: 1600000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2200000, currency: 'KRW' },
    ],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Parents Healing journey',
    },
  },
  {
    id: '103',
    theme: 'GOLF_CHALLENGE',
    name: 'Golf Challenge · Journey 01',
    description: 'A curated journey shaped by the Golf Challenge theme.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
      { style: 'GRAND', amount: 1800000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2500000, currency: 'KRW' },
    ],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Golf Challenge journey one',
    },
  },
  {
    id: '104',
    theme: 'GOLF_CHALLENGE',
    name: 'Golf Challenge · Journey 02',
    description: 'A second TourProduct in the same Theme, with its own detail identity.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'CLASSIC', amount: 1300000, currency: 'KRW' },
      { style: 'GRAND', amount: 1900000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2600000, currency: 'KRW' },
    ],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Golf Challenge journey two',
    },
  },
  {
    id: '105',
    theme: 'OUTDOOR_TREKKING',
    name: 'Outdoor Trekking · Journey 01',
    description: 'A curated journey shaped by the Outdoor Trekking theme.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    stylePrices: [
      { style: 'CLASSIC', amount: 1100000, currency: 'KRW' },
      { style: 'GRAND', amount: 1700000, currency: 'KRW' },
      { style: 'PREMIUM', amount: 2300000, currency: 'KRW' },
    ],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Outdoor Trekking journey',
    },
  },
] as const satisfies readonly TourProductSummaryModel[];

const partialFailureProducts = tourDiscoveryPreviewProducts.filter(
  (product) => product.theme !== 'PARENTS_HEALING',
);

const imageFailureProducts = tourDiscoveryPreviewProducts.map((product) =>
  product.id === '103'
    ? {
        ...product,
        media: {
          imageSrc: '/__missing-tour-discovery-image__.jpg',
          imageAlt: 'Golf journey preview',
          fallbackLabel: 'Golf Challenge visual unavailable',
        },
      }
    : product,
);

/**
 * B05 state QA용 Frontend View Model scenarios다.
 * 실제 network response shape를 흉내 내지 않고 Page가 받을 상태만 표현한다.
 */
export const tourDiscoveryPreviewStates = {
  happy: {
    status: 'ready',
    products: tourDiscoveryPreviewProducts,
    freshness: 'current',
  },
  loading: {
    status: 'loading',
  },
  empty: {
    status: 'empty',
  },
  networkError: {
    status: 'error',
    reason: 'network',
  },
  serverError: {
    status: 'error',
    reason: 'server',
  },
  fatalMismatch: {
    status: 'error',
    reason: 'data-mismatch',
  },
  partialFailure: {
    status: 'ready',
    products: partialFailureProducts,
    freshness: 'current',
    unavailableThemes: ['PARENTS_HEALING'],
  },
  imageFailure: {
    status: 'ready',
    products: imageFailureProducts,
    freshness: 'current',
  },
  refreshing: {
    status: 'ready',
    products: tourDiscoveryPreviewProducts,
    freshness: 'refreshing',
  },
  stale: {
    status: 'ready',
    products: tourDiscoveryPreviewProducts,
    freshness: 'stale',
  },
  offline: {
    status: 'ready',
    products: tourDiscoveryPreviewProducts,
    freshness: 'stale',
    offline: true,
  },
} as const satisfies Record<string, TourDiscoveryCollectionState>;
