export type ReservationReviewBlockingReason =
  | 'schedule-not-reservable'
  | 'configuration-invalid'
  | 'participant-invalid'
  | 'transport-capacity-invalid';

export type ReservationReviewValidationState =
  | { status: 'loading' }
  | { status: 'valid' }
  | { status: 'blocking'; reason: ReservationReviewBlockingReason }
  | { status: 'price-changed'; previousTotal: number; latestTotal: number; currency: 'KRW' }
  | { status: 'refreshing'; previous: ReservationReviewSettledValidation }
  | { status: 'offline'; previous: ReservationReviewSettledValidation | null };

export type ReservationReviewSettledValidation = Exclude<
  ReservationReviewValidationState,
  { status: 'loading' | 'refreshing' | 'offline' }
>;

export interface ReservationReviewValidationPresentation {
  tone: 'neutral' | 'warning' | 'blocking';
  title: string;
  message: string;
  correctionTarget: 'tour-detail' | 'configure' | null;
  requiresReconfirmation: boolean;
}

/**
 * Review validation 결과를 navigation/UX 의미로만 번역한다.
 *
 * INVARIANT:
 * - invalid selection을 자동 교체하지 않는다.
 * - price change를 자동 수락하지 않는다.
 * - refreshing/offline은 이전 successful truth가 있으면 그 truth를 유지한다.
 */
export function presentReservationReviewValidation(
  state: ReservationReviewValidationState,
): ReservationReviewValidationPresentation {
  if (state.status === 'refreshing') {
    return {
      ...presentReservationReviewValidation(state.previous),
      tone: 'neutral',
      title: 'Checking the latest trip details',
      message: 'Your last verified review remains visible while we refresh it.',
    };
  }

  if (state.status === 'offline') {
    return {
      tone: state.previous?.status === 'blocking' ? 'blocking' : 'warning',
      title: 'You are offline',
      message:
        state.previous === null
          ? 'Connect to verify this trip before applying.'
          : 'Your last verified review is still shown. Reconnect to check for changes before applying.',
      correctionTarget: null,
      requiresReconfirmation: false,
    };
  }

  if (state.status === 'loading') {
    return {
      tone: 'neutral',
      title: 'Checking the latest trip details',
      message: 'Your draft stays visible while availability and configuration are checked.',
      correctionTarget: null,
      requiresReconfirmation: false,
    };
  }

  if (state.status === 'valid') {
    return {
      tone: 'neutral',
      title: 'Trip details checked',
      message: 'No blocking changes were found.',
      correctionTarget: null,
      requiresReconfirmation: false,
    };
  }

  if (state.status === 'price-changed') {
    return {
      tone: 'warning',
      title: 'Price changed',
      message:
        'The latest price differs from the value you previously reviewed. Check it again before applying.',
      correctionTarget: null,
      requiresReconfirmation: true,
    };
  }

  const copy: Record<
    ReservationReviewBlockingReason,
    Omit<ReservationReviewValidationPresentation, 'requiresReconfirmation'>
  > = {
    'schedule-not-reservable': {
      tone: 'blocking',
      title: 'Schedule is no longer reservable',
      message: 'Choose another schedule before applying.',
      correctionTarget: 'tour-detail',
    },
    'configuration-invalid': {
      tone: 'blocking',
      title: 'Configuration needs attention',
      message: 'One or more selected options are no longer valid. Review your configuration.',
      correctionTarget: 'configure',
    },
    'participant-invalid': {
      tone: 'blocking',
      title: 'Traveller count needs attention',
      message: 'Update the traveller count before applying.',
      correctionTarget: 'configure',
    },
    'transport-capacity-invalid': {
      tone: 'blocking',
      title: 'Transport capacity needs attention',
      message:
        'The selected transport cannot carry this traveller count. Choose a valid configuration.',
      correctionTarget: 'configure',
    },
  };

  return { ...copy[state.reason], requiresReconfirmation: true };
}

export function canSubmitReservationReview(state: ReservationReviewValidationState) {
  return state.status === 'valid';
}
