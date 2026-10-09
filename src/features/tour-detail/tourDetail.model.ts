export type TourDetailTheme =
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING';

export type TourDetailStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';

export interface TourDetailMediaModel {
  imageSrc: string | null;
  imageAlt: string;
  fallbackLabel: string;
}

export interface IncludedExperienceModel {
  key: string;
  title: string;
  description: string;
  media: TourDetailMediaModel;
}

export interface TourDetailStylePriceModel {
  style: TourDetailStyle;
  amount: number;
  currency: 'KRW';
}

export interface TourDetailModel {
  /**
   * Frontend-facing TourProduct identity.
   * Real resources are canonical decimal strings; mock identities may be opaque.
   */
  id: string;
  theme: TourDetailTheme;
  themeLabel: string;
  name: string;
  summary: string;
  storyTitle: string;
  storyBody: string;
  heroMedia: TourDetailMediaModel;
  storyMedia: TourDetailMediaModel;
  includedExperiences: readonly IncludedExperienceModel[];
  availableStyles: readonly TourDetailStyle[];
  stylePrices: readonly TourDetailStylePriceModel[];
}

export interface ScheduleChoiceModel {
  /** Backend-derived calendar identity. Legacy presentation-only fixtures may omit it. */
  calendar?: { tourProductId: number; startDate: string; endDate: string };
  /**
   * Frontend-facing TourSchedule identity.
   * Real resources are canonical decimal strings; mock identities may be opaque.
   */
  selectionKey: string;
  dateLabel: string;
  statusLabel: string;
  recruitmentSummary: string;
  isSelectable: boolean;
}

export type TourScheduleFreshness = 'current' | 'refreshing' | 'stale';
export type TourScheduleErrorReason = 'network' | 'server' | 'data-mismatch';

export type TourScheduleSectionState =
  | { status: 'loading' }
  | { status: 'empty' }
  | {
      status: 'error';
      reason: TourScheduleErrorReason;
      isRetrying?: boolean;
    }
  | {
      status: 'ready';
      choices: readonly ScheduleChoiceModel[];
      freshness?: TourScheduleFreshness;
      hasPartialError?: boolean;
      isRetrying?: boolean;
    };

export type TourDetailCoreErrorReason = 'network' | 'server' | 'data-mismatch';

export type TourDetailCoreState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | {
      status: 'error';
      reason: TourDetailCoreErrorReason;
      isRetrying?: boolean;
    }
  | {
      status: 'ready';
      tour: TourDetailModel;
    };
