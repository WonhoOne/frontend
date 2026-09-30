import type {
  ScheduleChoiceModel,
  TourDetailModel,
  TourDetailTheme,
  TourScheduleSectionState,
} from '@/features/tour-detail/tourDetail.model';

function buildRecruitmentSummary(theme: TourDetailTheme) {
  if (theme === 'HONEYMOON_ROMANCE') {
    return '2 couples/teams required · 1 couple/team = 2 participants';
  }

  return '3 participants required';
}

function buildScheduleChoices(theme: TourDetailTheme): readonly ScheduleChoiceModel[] {
  const recruitmentSummary = buildRecruitmentSummary(theme);

  return [
    {
      selectionKey: `preview-${theme.toLowerCase()}-a`,
      dateLabel: 'Schedule preview A · Dates supplied by approved schedule data',
      statusLabel: 'Recruiting',
      recruitmentSummary,
      isSelectable: true,
    },
    {
      selectionKey: `preview-${theme.toLowerCase()}-b`,
      dateLabel: 'Schedule preview B · Dates supplied by approved schedule data',
      statusLabel: 'Unavailable',
      recruitmentSummary: 'Registration unavailable',
      isSelectable: false,
    },
  ];
}

const readyByTheme = {
  HONEYMOON_ROMANCE: {
    status: 'ready',
    choices: buildScheduleChoices('HONEYMOON_ROMANCE'),
  },
  PARENTS_HEALING: {
    status: 'ready',
    choices: buildScheduleChoices('PARENTS_HEALING'),
  },
  GOLF_CHALLENGE: {
    status: 'ready',
    choices: buildScheduleChoices('GOLF_CHALLENGE'),
  },
  OUTDOOR_TREKKING: {
    status: 'ready',
    choices: buildScheduleChoices('OUTDOOR_TREKKING'),
  },
} as const satisfies Record<TourDetailTheme, TourScheduleSectionState>;

/**
 * B09 Schedule/Recruitment presentation fixture.
 *
 * MOCK CONTRACT:
 * - Backend TourSchedule DTO를 흉내 내지 않는다.
 * - preview date label은 실제 여행 날짜를 주장하지 않는다.
 * - recruitment/status/selectability는 이미 결정된 표시용 truth다.
 * - UI가 participant count를 합산해 confirmed 여부를 계산하지 않는다.
 */
export function findTourSchedulePreview(tour: Pick<TourDetailModel, 'theme'>) {
  return readyByTheme[tour.theme];
}

const golfChoices = buildScheduleChoices('GOLF_CHALLENGE');

export const tourSchedulePreviewStates = {
  loading: { status: 'loading' },
  empty: { status: 'empty' },
  networkError: { status: 'error', reason: 'network' },
  serverError: { status: 'error', reason: 'server' },
  fatalMismatch: { status: 'error', reason: 'data-mismatch' },
  partialError: {
    status: 'ready',
    choices: golfChoices,
    hasPartialError: true,
  },
  refreshing: {
    status: 'ready',
    choices: golfChoices,
    freshness: 'refreshing',
  },
  stale: {
    status: 'ready',
    choices: golfChoices,
    freshness: 'stale',
  },
  unavailable: {
    status: 'ready',
    choices: golfChoices.map((choice) => ({
      ...choice,
      statusLabel: 'Unavailable',
      recruitmentSummary: 'Registration unavailable',
      isSelectable: false,
    })),
  },
} as const satisfies Record<string, TourScheduleSectionState>;
