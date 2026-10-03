import type { ResourceId } from '@/shared/lib/resourceIdentity';

export type TourTheme =
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING';

export type TourStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';

export interface DiscoveryMediaModel {
  /** Canonical TourProduct resource identity. */
  id: ResourceId;
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
      offline?: boolean;
      unavailableThemes?: readonly TourTheme[];
    };
