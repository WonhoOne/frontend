export type TourTheme =
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING';

export type TourStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';

export interface DiscoveryMediaModel {
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

export interface TourStylePriceModel {
  style: TourStyle;
  amount: number;
  currency: 'KRW';
}

export interface TourProductSummaryModel {
  /**
   * Frontend-facing TourProduct identity.
   *
   * Real Backend resources use canonical decimal strings. Explicit DEV fixtures
   * may use opaque strings without claiming a Backend wire identity.
   */
  id: string;
  theme: TourTheme;
  name: string;
  description: string;
  availableStyles: readonly TourStyle[];
  stylePrices: readonly TourStylePriceModel[];
  media: DiscoveryMediaModel;
}

export interface ThemeDiscoveryGroupModel {
  presentation: ThemeDiscoveryPresentation;
  products: readonly TourProductSummaryModel[];
}

export type TourDiscoveryFreshness = 'current' | 'refreshing' | 'stale';
export type TourDiscoveryCollectionErrorReason = 'network' | 'server' | 'data-mismatch';

export type TourDiscoveryCollectionState =
  | { status: 'loading' }
  | { status: 'empty' }
  | {
      status: 'error';
      reason: TourDiscoveryCollectionErrorReason;
      isRetrying?: boolean;
    }
  | {
      status: 'ready';
      products: readonly TourProductSummaryModel[];
      freshness?: TourDiscoveryFreshness;
      offline?: boolean;
      unavailableThemes?: readonly TourTheme[];
    };
