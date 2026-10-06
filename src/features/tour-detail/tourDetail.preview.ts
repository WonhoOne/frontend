import {
  createTourDetailMedia as media,
  themeDetailPresentations,
} from '@/features/tour-detail/tourDetailPresentations';
import type {
  TourDetailCoreState,
  TourDetailModel,
  TourDetailTheme,
} from '@/features/tour-detail/tourDetail.model';

const previewProductDefinitions = [
  ['101', 'HONEYMOON_ROMANCE', 'Honeymoon Romance · Journey 01'],
  ['102', 'PARENTS_HEALING', 'Parents Healing · Journey 01'],
  ['103', 'GOLF_CHALLENGE', 'Golf Challenge · Journey 01'],
  ['104', 'GOLF_CHALLENGE', 'Golf Challenge · Journey 02'],
  ['105', 'OUTDOOR_TREKKING', 'Outdoor Trekking · Journey 01'],
] as const satisfies readonly [string, TourDetailTheme, string][];

function buildPreviewTour(id: string, theme: TourDetailTheme, name: string): TourDetailModel {
  const presentation = themeDetailPresentations[theme];

  return {
    id,
    theme,
    themeLabel: presentation.themeLabel,
    name,
    summary: presentation.summary,
    storyTitle: presentation.storyTitle,
    storyBody: presentation.storyBody,
    heroMedia: media(`${presentation.themeLabel} hero visual unavailable`),
    storyMedia: media(`${presentation.themeLabel} story visual unavailable`),
    includedExperiences: presentation.includedExperiences,
    availableStyles: presentation.availableStyles,
    stylePrices: presentation.availableStyles.map((style, index) => ({
      style,
      amount: 1000000 + index * 500000,
      currency: 'KRW' as const,
    })),
  };
}

/**
 * IMP-2 Tour Detail용 Frontend preview catalog다.
 *
 * MOCK CONTRACT:
 * - Backend DTO를 흉내 내지 않는다.
 * - 실제 destination/date/hotel/price/schedule을 만들지 않는다.
 * - Discovery에서 사용한 TourProduct identity를 그대로 이어 받아 Theme와 Product를 분리한다.
 */
export const tourDetailPreviewProducts = previewProductDefinitions.map(([id, theme, name]) =>
  buildPreviewTour(id, theme, name),
);

export function findTourDetailPreview(tourId: string) {
  return tourDetailPreviewProducts.find((tour) => tour.id === tourId) ?? null;
}

const imageFailureTour: TourDetailModel = {
  ...buildPreviewTour('103', 'GOLF_CHALLENGE', 'Golf Challenge · Journey 01'),
  heroMedia: {
    imageSrc: '/__missing-tour-detail-hero__.jpg',
    imageAlt: 'Golf Challenge editorial preview',
    fallbackLabel: 'Golf Challenge hero visual unavailable',
  },
};

export const tourDetailPreviewStates = {
  loading: { status: 'loading' },
  networkError: { status: 'error', reason: 'network' },
  serverError: { status: 'error', reason: 'server' },
  fatalMismatch: { status: 'error', reason: 'data-mismatch' },
  imageFailure: { status: 'ready', tour: imageFailureTour },
} as const satisfies Record<string, TourDetailCoreState>;
