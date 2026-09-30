export type TourTheme =
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING';

export type TourStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';

export interface DiscoveryMediaModel {
  /**
   * Frontend-owned editorial asset path.
   *
   * null means the UI must render its branded fallback instead of assuming
   * a Backend image field exists.
   */
  imageSrc: string | null;
  imageAlt: string;
  fallbackLabel: string;
}

export interface ThemeDiscoveryPresentation {
  theme: TourTheme;
  title: string;
  positioningLine: string;
  highlights: readonly string[];
  availableStyles: readonly TourStyle[];
  media: DiscoveryMediaModel;
}

export interface TourProductSummaryModel {
  /**
   * Frontend-facing product identity.
   *
   * CONTRACT: This is a TourProduct identity, never a Theme value.
   * Mock fixtures may use explicit demo IDs until an approved DTO adapter exists.
   */
  id: string;
  theme: TourTheme;
  name: string;
  description: string;
  availableStyles: readonly TourStyle[];
  media: DiscoveryMediaModel;
}

export interface ThemeDiscoveryGroupModel {
  presentation: ThemeDiscoveryPresentation;
  products: readonly TourProductSummaryModel[];
}
