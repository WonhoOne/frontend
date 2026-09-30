import type { TourProductSummaryModel } from '@/features/tour-discovery';

/**
 * IMP-2 Discovery 전용 개발 fixture다.
 *
 * MOCK CONTRACT:
 * - Backend DTO가 아니며 API v0.2 field shape를 주장하지 않는다.
 * - 같은 Theme에 여러 TourProduct를 의도적으로 포함해 Theme 1:N을 검증한다.
 * - 실제 destination / schedule / price / hotel 이름을 만들어내지 않는다.
 * - imageSrc null은 local fallback presentation 검증용이다.
 */
export const tourDiscoveryProductFixtures = [
  {
    id: 'demo-honeymoon-product-a',
    theme: 'HONEYMOON_ROMANCE',
    name: '[Demo] Honeymoon Product A',
    description: 'Contract-safe Discovery fixture.',
    availableStyles: ['GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Demo Honeymoon Product A',
    },
  },
  {
    id: 'demo-parents-product-a',
    theme: 'PARENTS_HEALING',
    name: '[Demo] Parents Product A',
    description: 'Contract-safe Discovery fixture.',
    availableStyles: ['GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Demo Parents Product A',
    },
  },
  {
    id: 'demo-golf-product-a',
    theme: 'GOLF_CHALLENGE',
    name: '[Demo] Golf Product A',
    description: 'Contract-safe Discovery fixture.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Demo Golf Product A',
    },
  },
  {
    id: 'demo-golf-product-b',
    theme: 'GOLF_CHALLENGE',
    name: '[Demo] Golf Product B',
    description: 'Second product in the same Theme to guard the 1:N contract.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Demo Golf Product B',
    },
  },
  {
    id: 'demo-trekking-product-a',
    theme: 'OUTDOOR_TREKKING',
    name: '[Demo] Trekking Product A',
    description: 'Contract-safe Discovery fixture.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Demo Trekking Product A',
    },
  },
] as const satisfies readonly TourProductSummaryModel[];
