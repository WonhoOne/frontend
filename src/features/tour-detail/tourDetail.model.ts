import type { ResourceId } from '@/shared/lib/resourceIdentity';

export type TourDetailTheme =
  'HONEYMOON_ROMANCE' | 'PARENTS_HEALING' | 'GOLF_CHALLENGE' | 'OUTDOOR_TREKKING';

export type TourDetailStyle = 'CLASSIC' | 'GRAND' | 'PREMIUM';

export interface TourDetailMediaModel {
  /**
   * Frontend presentation media.
   *
   * null means the Detail UI must keep its reserved geometry and branded
   * fallback instead of assuming that an image URL exists in Backend data.
   */
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

export interface TourDetailModel {
  /**
   * Frontend-facing TourProduct identity.
   *
   * CONTRACT: This identifies a TourProduct, never a Theme.
   * Preview values do not claim a Backend ID type or format.
   */
  id: ResourceId;
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
}

/**
 * B09가 소비할 Frontend-facing schedule presentation boundary다.
 *
 * CONTRACT:
 * - Backend TourSchedule DTO shape가 아니다.
 * - date/status/recruitment text는 adapter가 준비해 준 presentation truth를 받는다.
 * - UI가 raw reservation count를 이용해 confirmed 여부를 재계산하지 않는다.
 */
export interface ScheduleChoiceModel {
  selectionKey: ResourceId;
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
