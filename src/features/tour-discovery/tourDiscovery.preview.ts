import type { TourProductSummaryModel } from '@/features/tour-discovery/tourDiscovery.model';

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
    id: 'demo-honeymoon-product-a',
    theme: 'HONEYMOON_ROMANCE',
    name: 'Honeymoon Romance · Journey 01',
    description: 'A curated journey shaped by the Honeymoon Romance theme.',
    availableStyles: ['GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Honeymoon Romance journey',
    },
  },
  {
    id: 'demo-parents-product-a',
    theme: 'PARENTS_HEALING',
    name: 'Parents Healing · Journey 01',
    description: 'A curated journey shaped by the Parents Healing theme.',
    availableStyles: ['GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Parents Healing journey',
    },
  },
  {
    id: 'demo-golf-product-a',
    theme: 'GOLF_CHALLENGE',
    name: 'Golf Challenge · Journey 01',
    description: 'A curated journey shaped by the Golf Challenge theme.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Golf Challenge journey one',
    },
  },
  {
    id: 'demo-golf-product-b',
    theme: 'GOLF_CHALLENGE',
    name: 'Golf Challenge · Journey 02',
    description: 'A second TourProduct in the same Theme, with its own detail identity.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Golf Challenge journey two',
    },
  },
  {
    id: 'demo-trekking-product-a',
    theme: 'OUTDOOR_TREKKING',
    name: 'Outdoor Trekking · Journey 01',
    description: 'A curated journey shaped by the Outdoor Trekking theme.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Outdoor Trekking journey',
    },
  },
] as const satisfies readonly TourProductSummaryModel[];
