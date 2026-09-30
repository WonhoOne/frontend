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

export type TourDiscoveryFreshness = 'current' | 'refreshing' | 'stale';

export type TourDiscoveryCollectionErrorReason = 'network' | 'server' | 'data-mismatch';

/**
 * Tours Collection이 받을 Frontend state boundary다.
 *
 * CONTRACT:
 * - Backend DTO/error payload가 아니다.
 * - success content와 freshness signal을 분리해 refresh 실패 시 기존 content를 보존한다.
 * - unavailableThemes는 부분 실패를 명시하며 product count 0과 혼동하지 않는다.
 */
export type TourDiscoveryCollectionState =
  | {
      status: 'loading';
    }
  | {
      status: 'empty';
    }
  | {
      status: 'error';
      reason: TourDiscoveryCollectionErrorReason;
      isRetrying?: boolean;
    }
  | {
      status: 'ready';
      products: readonly TourProductSummaryModel[];
      freshness?: TourDiscoveryFreshness;
      unavailableThemes?: readonly TourTheme[];
    };
