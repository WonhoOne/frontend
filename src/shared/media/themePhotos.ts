import golfPhoto from '@/assets/tours/golf.webp';
import honeymoonPhoto from '@/assets/tours/honeymoon.webp';
import parentsPhoto from '@/assets/tours/parents.webp';
import trekkingPhoto from '@/assets/tours/trekking.webp';

export interface ThemePhoto {
  src: string;
  alt: string;
}

/**
 * Frontend-owned editorial photos, one per fixed Theme.
 *
 * WHY: the Shared contract carries no TourProduct image field (D-04), so photos belong to
 * the Theme presentation, not to Backend data. Every product of a Theme shares its photo.
 * Sources are free photos under the Unsplash License; see src/assets/tours/CREDITS.md.
 */
export const themePhotos = {
  HONEYMOON_ROMANCE: {
    src: honeymoonPhoto,
    alt: 'Overwater villas above clear turquoise water in the Maldives',
  },
  PARENTS_HEALING: {
    src: parentsPhoto,
    alt: 'Sunlit spa lounge with rows of reclining chairs',
  },
  GOLF_CHALLENGE: {
    src: golfPhoto,
    alt: 'Green golf course fairway lined with trees and a small pond',
  },
  OUTDOOR_TREKKING: {
    src: trekkingPhoto,
    alt: 'Dirt trail climbing a grassy ridge toward snow-capped mountains',
  },
} as const satisfies Record<
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING',
  ThemePhoto
>;
