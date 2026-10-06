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
  const baseId = {
    HONEYMOON_ROMANCE: 1100,
    PARENTS_HEALING: 1200,
    GOLF_CHALLENGE: 1300,
    OUTDOOR_TREKKING: 1400,
  }[theme];

  return [
    {
      selectionKey: String(baseId + 1),
      dateLabel: 'Schedule preview A · Dates supplied by approved schedule data',
      statusLabel: 'Recruiting',
      recruitmentSummary,
      isSelectable: true,
    },
    {
      selectionKey: String(baseId + 2),
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
