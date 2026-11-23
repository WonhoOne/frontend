import couplePhoto from '@/assets/tours/couple-shirts.webp';
import ginsengPhoto from '@/assets/tours/ginseng.webp';
import golfAccessoriesPhoto from '@/assets/tours/golf-accessories.webp';
import golfResortPhoto from '@/assets/tours/golf-resort.webp';
import massagePhoto from '@/assets/tours/massage.webp';
import privateCarPhoto from '@/assets/tours/private-car.webp';
import romanticRoomPhoto from '@/assets/tours/romantic-room.webp';
import scarfPhoto from '@/assets/tours/scarf.webp';
import storyGolfPhoto from '@/assets/tours/story-golf.webp';
import storyHoneymoonPhoto from '@/assets/tours/story-honeymoon.webp';
import storyParentsPhoto from '@/assets/tours/story-parents.webp';
import storyTrekkingPhoto from '@/assets/tours/story-trekking.webp';
import trekkingAdventurePhoto from '@/assets/tours/trekking-adventure.webp';
import vanPhoto from '@/assets/tours/van.webp';
import type { ThemePhoto } from './themePhotos';

/**
 * Frontend-owned photos for the Tour Detail story and included-experience cards.
 * Illustrative only: they show the kind of offering, not a specific destination or item.
 * Free photos under the Unsplash License; see src/assets/tours/CREDITS.md.
 */
export const storyPhotos = {
  HONEYMOON_ROMANCE: {
    src: storyHoneymoonPhoto,
    alt: 'Couple holding hands on a beach at golden hour',
  },
  PARENTS_HEALING: {
    src: storyParentsPhoto,
    alt: 'Older couple walking hand in hand along a wooden boardwalk',
  },
  GOLF_CHALLENGE: {
    src: storyGolfPhoto,
    alt: 'Golfer teeing off against the low morning sun',
  },
  OUTDOOR_TREKKING: {
    src: storyTrekkingPhoto,
    alt: 'Hikers on a mountain trail below misty peaks',
  },
} as const satisfies Record<
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING',
  ThemePhoto
>;

export const experiencePhotos = {
  romanticRoom: { src: romanticRoomPhoto, alt: 'Hotel bed decorated with rose petals and ribbons' },
  coupleShirts: { src: couplePhoto, alt: 'Two folded cotton T-shirts' },
  privateCar: { src: privateCarPhoto, alt: 'Dark luxury sedan parked at the roadside' },
  massage: { src: massagePhoto, alt: 'Massage therapist pouring oil during a spa treatment' },
  ginseng: { src: ginsengPhoto, alt: 'Fresh ginseng root on a bed of moss' },
  groupVan: { src: vanPhoto, alt: 'Front of a dark premium passenger van with headlights on' },
  golfResort: { src: golfResortPhoto, alt: 'Golf carts on a resort course lined with palm trees' },
  golfAccessories: { src: golfAccessoriesPhoto, alt: 'Basket of golf balls on a practice green' },
  trekkingAdventure: {
    src: trekkingAdventurePhoto,
    alt: 'Two hikers climbing a rocky mountain ridge',
  },
  scarf: { src: scarfPhoto, alt: 'Person wearing a plaid scarf outdoors in autumn' },
} as const satisfies Record<string, ThemePhoto>;
