import type {
  ThemeDiscoveryPresentation,
  TourTheme,
} from '@/features/tour-discovery/tourDiscovery.model';

export const TOUR_THEME_ORDER = [
  'HONEYMOON_ROMANCE',
  'PARENTS_HEALING',
  'GOLF_CHALLENGE',
  'OUTDOOR_TREKKING',
] as const satisfies readonly TourTheme[];

/**
 * Discovery 화면의 Frontend-owned editorial presentation이다.
 *
 * CONTRACT:
 * - Theme catalog / included offering / allowed style은 docs/main v0.1.2를 따른다.
 * - copy와 local media mapping은 Frontend presentation 책임이다.
 * - imageSrc가 null인 것은 Backend image field를 추측하지 않기 위한 의도적인 상태다.
 */
export const themeDiscoveryPresentations = [
  {
    theme: 'HONEYMOON_ROMANCE',
    title: 'Honeymoon Romance',
    positioningLine: 'For two, made unforgettable.',
    highlights: [
      'Romantic room decoration for two',
      'Couple commemorative T-shirts',
      'Private luxury vehicle for two',
    ],
    availableStyles: ['GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Honeymoon Romance',
    },
  },
  {
    theme: 'PARENTS_HEALING',
    title: 'Parents Healing',
    positioningLine: 'A slower journey, made with care.',
    highlights: [
      'Massage and acupressure service',
      'Health ginseng souvenir',
      '10-seat luxury vehicle',
    ],
    availableStyles: ['GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Parents Healing',
    },
  },
  {
    theme: 'GOLF_CHALLENGE',
    title: 'Golf Challenge',
    positioningLine: 'A refined escape built around the game.',
    highlights: ['Golf resort theme', 'Golf accessories and golf balls', '10-seat luxury vehicle'],
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Golf Challenge',
    },
  },
  {
    theme: 'OUTDOOR_TREKKING',
    title: 'Outdoor Trekking',
    positioningLine: 'Go farther. Breathe deeper.',
    highlights: [
      'Trekking and mountain adventure theme',
      'Outdoor souvenir scarf',
      '10-seat luxury vehicle',
    ],
    availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
    media: {
      imageSrc: null,
      imageAlt: '',
      fallbackLabel: 'Outdoor Trekking',
    },
  },
] as const satisfies readonly ThemeDiscoveryPresentation[];
