import type {
  IncludedExperienceModel,
  TourDetailCoreState,
  TourDetailModel,
  TourDetailStyle,
  TourDetailTheme,
} from '@/features/tour-detail/tourDetail.model';

interface ThemeDetailPresentation {
  theme: TourDetailTheme;
  themeLabel: string;
  summary: string;
  storyTitle: string;
  storyBody: string;
  availableStyles: readonly TourDetailStyle[];
  includedExperiences: readonly IncludedExperienceModel[];
}

function media(fallbackLabel: string) {
  return {
    imageSrc: null,
    imageAlt: '',
    fallbackLabel,
  } as const;
}

export const themeDetailPresentations = {
  HONEYMOON_ROMANCE: {
    theme: 'HONEYMOON_ROMANCE',
    themeLabel: 'Honeymoon Romance',
    summary: 'A journey shaped around time together and the Honeymoon Romance experience.',
    storyTitle: 'A more considered way to travel together.',
    storyBody:
      'The experience begins with the approved Honeymoon Romance offering, leaving destination, dates, hotel and price to contract-backed product data rather than assumptions.',
    availableStyles: ['GRAND', 'PREMIUM'],
    includedExperiences: [
      {
        key: 'romantic-room',
        title: 'Romantic room decoration',
        description: 'A two-person romantic room setup is included in this Theme offering.',
        media: media('Romantic room experience'),
      },
      {
        key: 'couple-shirts',
        title: 'Commemorative T-shirts',
        description: 'Commemorative T-shirts for the couple are included.',
        media: media('Couple commemorative T-shirts'),
      },
      {
        key: 'private-vehicle',
        title: 'Private luxury vehicle',
        description: 'A private luxury vehicle for two is included.',
        media: media('Private luxury vehicle for two'),
      },
    ],
  },
  PARENTS_HEALING: {
    theme: 'PARENTS_HEALING',
    themeLabel: 'Parents Healing',
    summary: 'A restorative journey shaped around the Parents Healing experience.',
    storyTitle: 'Comfort and care set the rhythm.',
    storyBody:
      'The approved Parents Healing offering stays at the center while destination, dates, hotel and price remain intentionally unstated until contract-backed product data is connected.',
    availableStyles: ['GRAND', 'PREMIUM'],
    includedExperiences: [
      {
        key: 'massage',
        title: 'Massage and acupressure',
        description: 'A massage and acupressure service is included in this Theme offering.',
        media: media('Massage and acupressure service'),
      },
      {
        key: 'ginseng',
        title: 'Health ginseng souvenir',
        description: 'A health ginseng souvenir is included.',
        media: media('Health ginseng souvenir'),
      },
      {
        key: 'luxury-vehicle',
        title: 'Luxury group vehicle',
        description: 'A 10-seat luxury vehicle is included.',
        media: media('10-seat luxury vehicle'),
      },
    ],
  },
  GOLF_CHALLENGE: {
    theme: 'GOLF_CHALLENGE',
    themeLabel: 'Golf Challenge',
    summary: 'A journey built around the approved Golf Challenge experience.',
    storyTitle: 'The game becomes the shape of the journey.',
    storyBody:
      'Golf-focused experience comes first. Destination, dates, resort identity, hotel and price are left open until approved product data can describe them.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    includedExperiences: [
      {
        key: 'golf-resort-theme',
        title: 'Golf resort theme',
        description: 'The journey is built around the approved golf resort Theme offering.',
        media: media('Golf resort theme'),
      },
      {
        key: 'golf-accessories',
        title: 'Golf accessories',
        description: 'Golf accessories and golf balls are included.',
        media: media('Golf accessories and golf balls'),
      },
      {
        key: 'luxury-vehicle',
        title: 'Luxury group vehicle',
        description: 'A 10-seat luxury vehicle is included.',
        media: media('10-seat luxury vehicle'),
      },
    ],
  },
  OUTDOOR_TREKKING: {
    theme: 'OUTDOOR_TREKKING',
    themeLabel: 'Outdoor Trekking',
    summary: 'A journey shaped around trekking, mountain and adventure experiences.',
    storyTitle: 'Built for the outdoors, without inventing the destination.',
    storyBody:
      'The approved Outdoor Trekking offering defines the experience while destination, dates, route, hotel and price wait for contract-backed product data.',
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    includedExperiences: [
      {
        key: 'trekking-theme',
        title: 'Trekking and mountain adventure',
        description: 'Trekking, mountain and adventure experiences define this Theme offering.',
        media: media('Trekking and mountain adventure'),
      },
      {
        key: 'scarf',
        title: 'Outdoor souvenir scarf',
        description: 'An outdoor souvenir scarf is included.',
        media: media('Outdoor souvenir scarf'),
      },
      {
        key: 'luxury-vehicle',
        title: 'Luxury group vehicle',
        description: 'A 10-seat luxury vehicle is included.',
        media: media('10-seat luxury vehicle'),
      },
    ],
  },
} as const satisfies Record<TourDetailTheme, ThemeDetailPresentation>;

const previewProductDefinitions = [
  [101, 'HONEYMOON_ROMANCE', 'Honeymoon Romance · Journey 01'],
  [102, 'PARENTS_HEALING', 'Parents Healing · Journey 01'],
  [103, 'GOLF_CHALLENGE', 'Golf Challenge · Journey 01'],
  [104, 'GOLF_CHALLENGE', 'Golf Challenge · Journey 02'],
  [105, 'OUTDOOR_TREKKING', 'Outdoor Trekking · Journey 01'],
] as const satisfies readonly [number, TourDetailTheme, string][];

function buildPreviewTour(id: number, theme: TourDetailTheme, name: string): TourDetailModel {
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

export function findTourDetailPreview(tourId: number) {
  return tourDetailPreviewProducts.find((tour) => tour.id === tourId) ?? null;
}

const imageFailureTour: TourDetailModel = {
  ...buildPreviewTour(103, 'GOLF_CHALLENGE', 'Golf Challenge · Journey 01'),
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
