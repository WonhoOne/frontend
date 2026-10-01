import { ReservationDataSourceError, type ReservationFieldError } from '@/features/reservation/reservation.error';

export type ReservationCorrectionTarget =
  | 'schedule'
  | 'participant-count'
  | 'hotel'
  | 'transport'
  | 'meal'
  | 'extras'
  | 'configuration';

export interface ReservationInlineIssue {
  target: ReservationCorrectionTarget;
  code: string;
}

export type ReservationSubmitRecovery =
  | {
      kind: 'schedule-conflict';
      code: 'SCHEDULE_NOT_RESERVABLE';
      correctionTarget: 'schedule';
      requiresFreshTruth: true;
      requiresReconfirmation: true;
    }
  | {
      kind: 'conflict';
      code: string;
      issues: readonly ReservationInlineIssue[];
      requiresFreshTruth: true;
      requiresReconfirmation: true;
    }
  | {
      kind: 'validation';
      code: string;
      issues: readonly ReservationInlineIssue[];
      requiresFreshTruth: false;
      requiresReconfirmation: true;
    };

function correctionTarget(field: string): ReservationCorrectionTarget {
  if (field === 'scheduleId' || field.startsWith('schedule.')) return 'schedule';
  if (field === 'participantCount') return 'participant-count';
  if (field.includes('hotelOption')) return 'hotel';
  if (field.includes('transportOption')) return 'transport';
  if (field.includes('mealOption')) return 'meal';
  if (field.includes('extraOptions')) return 'extras';
  return 'configuration';
}

function mapIssues(fieldErrors: readonly ReservationFieldError[]): ReservationInlineIssue[] {
  return fieldErrors.map(({ field, code }) => ({
    target: correctionTarget(field),
    code,
  }));
}

/**
 * 409/422 recovery는 HTTP adapter가 제공한 stable code와 fieldErrors만 해석한다.
 *
 * INVARIANT:
 * - human-readable message parsing 금지.
 * - Draft 값을 자동 변경/교체하지 않는다.
 * - conflict는 latest truth 확인 뒤 사용자가 직접 correction/reconfirm 해야 한다.
 */
export function getReservationSubmitRecovery(error: unknown): ReservationSubmitRecovery | null {
  if (!(error instanceof ReservationDataSourceError)) return null;

  const detail = error.detail;

  if (detail.kind === 'conflict') {
    if (detail.code === 'SCHEDULE_NOT_RESERVABLE') {
      return {
        kind: 'schedule-conflict',
        code: 'SCHEDULE_NOT_RESERVABLE',
        correctionTarget: 'schedule',
        requiresFreshTruth: true,
        requiresReconfirmation: true,
      };
    }

    return {
      kind: 'conflict',
      code: detail.code,
      issues: mapIssues(detail.fieldErrors),
      requiresFreshTruth: true,
      requiresReconfirmation: true,
    };
  }

  if (detail.kind === 'validation') {
    return {
      kind: 'validation',
      code: detail.code,
      issues: mapIssues(detail.fieldErrors),
      requiresFreshTruth: false,
      requiresReconfirmation: true,
    };
  }

  return null;
}
