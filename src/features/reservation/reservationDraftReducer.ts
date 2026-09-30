import {
  createEmptyReservationDraft,
  type ReservationDraftResourceIdentity,
  type ReservationDraftSelectionKey,
  type ReservationDraftTourStyle,
  type ReservationDraftV1,
} from '@/features/reservation/ReservationDraft';

export type ReservationDraftAction =
  | {
      type: 'START_DRAFT';
      tourProductId: ReservationDraftResourceIdentity;
      updatedAt: number;
    }
  | {
      type: 'SELECT_TOUR_STYLE';
      tourStyle: ReservationDraftTourStyle | null;
      updatedAt: number;
    }
  | {
      type: 'SELECT_SCHEDULE';
      tourScheduleId: ReservationDraftResourceIdentity | null;
      updatedAt: number;
    }
  | {
      type: 'SET_PARTICIPANT_COUNT';
      participantCount: number | null;
      updatedAt: number;
    }
  | {
      type: 'SELECT_HOTEL';
      selectionKey: ReservationDraftSelectionKey | null;
      updatedAt: number;
    }
  | {
      type: 'SELECT_TRANSPORT';
      selectionKey: ReservationDraftSelectionKey | null;
      updatedAt: number;
    }
  | {
      type: 'SELECT_MEAL';
      selectionKey: ReservationDraftSelectionKey | null;
      updatedAt: number;
    }
  | {
      type: 'SET_EXTRAS';
      selectionKeys: readonly ReservationDraftSelectionKey[];
      updatedAt: number;
    }
  | {
      type: 'RESTORE_DRAFT';
      draft: ReservationDraftV1;
    }
  | {
      type: 'DISCARD_DRAFT';
      updatedAt: number;
    }
  | {
      type: 'CLEAR_AFTER_SUCCESS';
      updatedAt: number;
    };

/**
 * Reservation transaction intent만 변경하는 pure reducer다.
 *
 * LIFECYCLE:
 * Tour Detail → Configure → Review → later Auth interruption → Review restore
 * → Server-confirmed Reservation success → clear.
 *
 * Does not:
 * - participant/business validation을 판정하지 않음
 * - price/availability/recruitment truth를 저장하지 않음
 * - persistence/sessionStorage를 직접 다루지 않음
 */
export function reservationDraftReducer(
  state: ReservationDraftV1,
  action: ReservationDraftAction,
): ReservationDraftV1 {
  switch (action.type) {
    case 'START_DRAFT': {
      // INVARIANT: 다른 TourProduct의 transaction intent를 새 상품으로 넘기지 않는다.
      // option compatibility 계약 없이 어떤 field만 재사용할지 추측하는 것보다 새 Draft가 안전하다.
      return {
        ...createEmptyReservationDraft(action.updatedAt),
        tourProductId: action.tourProductId,
      };
    }

    case 'SELECT_TOUR_STYLE':
      return {
        ...state,
        tourStyle: action.tourStyle,
        updatedAt: action.updatedAt,
      };

    case 'SELECT_SCHEDULE':
      return {
        ...state,
        tourScheduleId: action.tourScheduleId,
        updatedAt: action.updatedAt,
      };

    case 'SET_PARTICIPANT_COUNT':
      return {
        ...state,
        participantCount: action.participantCount,
        updatedAt: action.updatedAt,
      };

    case 'SELECT_HOTEL':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          hotelSelectionKey: action.selectionKey,
        },
        updatedAt: action.updatedAt,
      };

    case 'SELECT_TRANSPORT':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          transportSelectionKey: action.selectionKey,
        },
        updatedAt: action.updatedAt,
      };

    case 'SELECT_MEAL':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          mealSelectionKey: action.selectionKey,
        },
        updatedAt: action.updatedAt,
      };

    case 'SET_EXTRAS':
      return {
        ...state,
        configuration: {
          ...state.configuration,
          extraSelectionKeys: [...action.selectionKeys],
        },
        updatedAt: action.updatedAt,
      };

    case 'RESTORE_DRAFT':
      // C2 persistence boundary가 runtime validation을 통과시킨 Draft만 이 action으로 전달한다.
      // reducer는 persistence format을 다시 해석하지 않고 immutable state만 재구성한다.
      return {
        ...action.draft,
        configuration: {
          ...action.draft.configuration,
          extraSelectionKeys: [...action.draft.configuration.extraSelectionKeys],
        },
      };

    case 'DISCARD_DRAFT':
      return createEmptyReservationDraft(action.updatedAt);

    case 'CLEAR_AFTER_SUCCESS':
      // INVARIANT: 실제 Server-confirmed success 뒤에만 caller가 이 action을 보낸다.
      // C1 reducer는 Reservation mutation 자체를 소유하지 않는다.
      return createEmptyReservationDraft(action.updatedAt);
  }
}
