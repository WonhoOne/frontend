export type ParticipantCountRule = 'general' | 'honeymoon';

export type ParticipantCountValidation =
  | {
      status: 'required';
      message: string;
    }
  | {
      status: 'invalid';
      reason: 'integer-required' | 'minimum' | 'honeymoon-pair-required';
      message: string;
    }
  | {
      status: 'valid';
      participantCount: number;
      coupleCount: null;
    }
  | {
      status: 'valid';
      participantCount: number;
      coupleCount: number;
    };

/**
 * Approved Shared v0.1.2 participant semantics만 판정한다.
 *
 * CONTRACT:
 * - General Reservation: integer participantCount >= 1
 * - HONEYMOON_ROMANCE Reservation: integer participantCount >= 2 and even
 * - Honeymoon coupleCount는 valid Reservation에서만 participantCount / 2로 파생
 *
 * Does not:
 * - participant maximum을 만들지 않음
 * - TourSchedule 전체 recruitment confirmation을 계산하지 않음
 * - capacity/availability/price 영향을 추측하지 않음
 */
export function validateParticipantCount(
  rule: ParticipantCountRule,
  participantCount: number | null,
): ParticipantCountValidation {
  if (participantCount === null) {
    return {
      status: 'required',
      message: 'Select the number of participants.',
    };
  }

  if (!Number.isFinite(participantCount) || !Number.isInteger(participantCount)) {
    return {
      status: 'invalid',
      reason: 'integer-required',
      message: 'Participant count must be a whole number.',
    };
  }

  if (rule === 'general') {
    if (participantCount < 1) {
      return {
        status: 'invalid',
        reason: 'minimum',
        message: 'Select at least 1 participant.',
      };
    }

    return {
      status: 'valid',
      participantCount,
      coupleCount: null,
    };
  }

  if (participantCount < 2) {
    return {
      status: 'invalid',
      reason: 'minimum',
      message: 'Honeymoon reservations require at least 2 participants.',
    };
  }

  if (participantCount % 2 !== 0) {
    return {
      status: 'invalid',
      reason: 'honeymoon-pair-required',
      message: 'Honeymoon participants must be selected in complete pairs.',
    };
  }

  return {
    status: 'valid',
    participantCount,
    coupleCount: participantCount / 2,
  };
}

export function formatParticipantCountSummary(
  validation: ParticipantCountValidation,
): string | null {
  if (validation.status !== 'valid') {
    return null;
  }

  if (validation.coupleCount === null) {
    return `${validation.participantCount} participant${validation.participantCount === 1 ? '' : 's'}`;
  }

  return `${validation.participantCount} participants · ${validation.coupleCount} couple${validation.coupleCount === 1 ? '' : 's'}/team${validation.coupleCount === 1 ? '' : 's'}`;
}
