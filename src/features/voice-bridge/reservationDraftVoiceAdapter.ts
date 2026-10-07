import type {
  ReservationDraftAction,
  ReservationDraftSelectionKey,
  ReservationDraftV1,
} from '@/features/reservation';
import { toCanonicalBackendResourceIdentity } from '@/shared/lib/resourceIdentity';

import type {
  VoiceExtraOption,
  VoiceHotelOption,
  VoiceMealOption,
  VoiceTourStyle,
  VoiceTransportOption,
} from '../../integrations/voice/voiceCommand';
import type { VoiceBridgeCapabilities } from './voiceCommandBridge';

export type ReservationDraftVoiceCapabilities = Pick<
  VoiceBridgeCapabilities,
  | 'selectTourProduct'
  | 'selectStyle'
  | 'selectSchedule'
  | 'setParticipantCount'
  | 'changeHotel'
  | 'changeTransport'
  | 'changeMeal'
  | 'addOption'
  | 'removeOption'
>;

/**
 * 현재 GUI/Feature state가 판단한 선택 가능성과 opaque selectionKey mapping이다.
 *
 * Voice bridge는 Shared Business Rule을 재계산하지 않는다. 현재 화면이 이미 가진
 * Product/Style/Schedule/participant/option truth를 이 경계로 주입받고, false/null이면
 * 해당 음성 명령을 현재 GUI context에서 사용할 수 없는 것으로 거절한다.
 */
export interface ReservationDraftVoiceContext {
  canSelectTourProduct: (tourProductId: number) => boolean;
  canSelectStyle: (style: VoiceTourStyle) => boolean;
  canSelectSchedule: (scheduleId: number) => boolean;
  canSetParticipantCount: (participantCount: number) => boolean;
  resolveHotelSelectionKey: (
    hotelOption: VoiceHotelOption,
  ) => ReservationDraftSelectionKey | null;
  resolveTransportSelectionKey: (
    transportOption: VoiceTransportOption,
  ) => ReservationDraftSelectionKey | null;
  resolveMealSelectionKey: (mealOption: VoiceMealOption) => ReservationDraftSelectionKey | null;
  resolveExtraSelectionKey: (
    extraOption: VoiceExtraOption,
  ) => ReservationDraftSelectionKey | null;
}

export interface CreateReservationDraftVoiceAdapterInput {
  /** Always read the latest Draft because Voice delivery can occur after a render/context change. */
  getDraft: () => ReservationDraftV1;
  /** Always read the latest GUI selection context for the same reason. */
  getContext: () => ReservationDraftVoiceContext;
  dispatch: (action: ReservationDraftAction) => void;
  now?: () => number;
}

/**
 * V6-B concrete Frontend Feature adapter.
 *
 * - Voice numeric Backend IDs are promoted to the merged Frontend canonical decimal identity helper.
 * - ReservationDraftAction is the only mutation surface; no parallel Voice state is created.
 * - Configuration selectionKey remains opaque and must come from the current GUI context resolver.
 * - Repeated commands are idempotent when the Draft already satisfies the requested selection.
 * - No Reservation submit/create, HTTP, storage, navigation, or Backend Business Rule authority exists here.
 */
export function createReservationDraftVoiceCapabilities({
  getDraft,
  getContext,
  dispatch,
  now = Date.now,
}: CreateReservationDraftVoiceAdapterInput): ReservationDraftVoiceCapabilities {
  return {
    selectTourProduct(tourProductId) {
      const identity = toCanonicalBackendResourceIdentity(tourProductId);
      const context = getContext();
      if (!context.canSelectTourProduct(tourProductId)) rejectCurrentContext();

      const draft = getDraft();
      if (draft.tourProductId === identity) return;

      dispatch({
        type: 'START_DRAFT',
        tourProductId: identity,
        updatedAt: now(),
      });
    },

    selectStyle(style) {
      const context = getContext();
      const draft = requireProductDraft(getDraft());
      if (!context.canSelectStyle(style)) rejectCurrentContext();
      if (draft.tourStyle === style) return;

      dispatch({ type: 'SELECT_TOUR_STYLE', tourStyle: style, updatedAt: now() });
    },

    selectSchedule(scheduleId) {
      const identity = toCanonicalBackendResourceIdentity(scheduleId);
      const context = getContext();
      const draft = requireProductDraft(getDraft());
      if (!context.canSelectSchedule(scheduleId)) rejectCurrentContext();
      if (draft.tourScheduleId === identity) return;

      dispatch({ type: 'SELECT_SCHEDULE', tourScheduleId: identity, updatedAt: now() });
    },

    setParticipantCount(participantCount) {
      const context = getContext();
      const draft = requireConfigureDraft(getDraft());
      if (!context.canSetParticipantCount(participantCount)) rejectCurrentContext();
      if (draft.participantCount === participantCount) return;

      dispatch({ type: 'SET_PARTICIPANT_COUNT', participantCount, updatedAt: now() });
    },

    changeHotel(hotelOption) {
      const context = getContext();
      const draft = requireConfigureDraft(getDraft());
      const selectionKey = requireSelectionKey(context.resolveHotelSelectionKey(hotelOption));
      if (draft.configuration.hotelSelectionKey === selectionKey) return;

      dispatch({ type: 'SELECT_HOTEL', selectionKey, updatedAt: now() });
    },

    changeTransport(transportOption) {
      const context = getContext();
      const draft = requireConfigureDraft(getDraft());
      const selectionKey = requireSelectionKey(
        context.resolveTransportSelectionKey(transportOption),
      );
      if (draft.configuration.transportSelectionKey === selectionKey) return;

      dispatch({ type: 'SELECT_TRANSPORT', selectionKey, updatedAt: now() });
    },

    changeMeal(mealOption) {
      const context = getContext();
      const draft = requireConfigureDraft(getDraft());
      const selectionKey = requireSelectionKey(context.resolveMealSelectionKey(mealOption));
      if (draft.configuration.mealSelectionKey === selectionKey) return;

      dispatch({ type: 'SELECT_MEAL', selectionKey, updatedAt: now() });
    },

    addOption(extraOption) {
      const context = getContext();
      const draft = requireConfigureDraft(getDraft());
      const selectionKey = requireSelectionKey(context.resolveExtraSelectionKey(extraOption));
      const current = draft.configuration.extraSelectionKeys;
      if (current.includes(selectionKey)) return;

      dispatch({
        type: 'SET_EXTRAS',
        selectionKeys: [...current, selectionKey],
        updatedAt: now(),
      });
    },

    removeOption(extraOption) {
      const context = getContext();
      const draft = requireConfigureDraft(getDraft());
      const selectionKey = requireSelectionKey(context.resolveExtraSelectionKey(extraOption));
      const current = draft.configuration.extraSelectionKeys;
      if (!current.includes(selectionKey)) return;

      dispatch({
        type: 'SET_EXTRAS',
        selectionKeys: current.filter((key) => key !== selectionKey),
        updatedAt: now(),
      });
    },
  };
}

function requireProductDraft(draft: ReservationDraftV1): ReservationDraftV1 {
  if (draft.tourProductId === null) rejectCurrentContext();
  return draft;
}

function requireConfigureDraft(draft: ReservationDraftV1): ReservationDraftV1 {
  if (
    draft.tourProductId === null ||
    draft.tourStyle === null ||
    draft.tourScheduleId === null
  ) {
    rejectCurrentContext();
  }
  return draft;
}

function requireSelectionKey(
  selectionKey: ReservationDraftSelectionKey | null,
): ReservationDraftSelectionKey {
  if (selectionKey === null || selectionKey.length === 0) rejectCurrentContext();
  return selectionKey;
}

function rejectCurrentContext(): never {
  // executeVoiceCommand intentionally sanitizes capability exceptions to CAPABILITY_FAILED.
  // Keep this internal error message empty so direct adapter misuse cannot leak GUI state.
  throw new Error();
}
