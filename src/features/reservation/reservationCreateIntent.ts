import type {
  ReservationDraftSelectionKey,
  ReservationDraftV1,
} from '@/features/reservation/ReservationDraft';
import type {
  CreateReservationInput,
  ReservationExtraOption,
  ReservationHotelOption,
  ReservationMealOption,
  ReservationTransportOption,
} from '@/features/reservation/reservation.model';

export interface ReservationCreateIdentityResolver {
  resolveScheduleId(selectionIdentity: string): number | null;
  resolveHotelOption(selectionKey: ReservationDraftSelectionKey): ReservationHotelOption | null;
  resolveTransportOption(
    selectionKey: ReservationDraftSelectionKey,
  ): ReservationTransportOption | null;
  resolveMealOption(selectionKey: ReservationDraftSelectionKey): ReservationMealOption | null;
  resolveExtraOption(selectionKey: ReservationDraftSelectionKey): ReservationExtraOption | null;
}

export type ReservationCreateIntentResult =
  | { status: 'ready'; input: CreateReservationInput }
  | { status: 'incomplete-draft' }
  | { status: 'unresolved-selection' };

/**
 * Frontend string transaction identity를 Backend Reservation create identity로
 * 승격하는 유일한 boundary다. Draft/route identity를 wire number로 간주하지 않는다.
 */
export function createReservationIntent(
  draft: ReservationDraftV1,
  resolver: ReservationCreateIdentityResolver,
): ReservationCreateIntentResult {
  const {
    tourScheduleId,
    tourStyle,
    participantCount,
    configuration: {
      hotelSelectionKey,
      transportSelectionKey,
      mealSelectionKey,
      extraSelectionKeys,
    },
  } = draft;

  if (
    tourScheduleId === null ||
    tourStyle === null ||
    participantCount === null ||
    hotelSelectionKey === null ||
    transportSelectionKey === null ||
    mealSelectionKey === null
  ) {
    return { status: 'incomplete-draft' };
  }

  const scheduleId = resolver.resolveScheduleId(tourScheduleId);
  const hotelOption = resolver.resolveHotelOption(hotelSelectionKey);
  const transportOption = resolver.resolveTransportOption(transportSelectionKey);
  const mealOption = resolver.resolveMealOption(mealSelectionKey);
  const extraOptions = extraSelectionKeys.map((key) => resolver.resolveExtraOption(key));

  if (
    scheduleId === null ||
    hotelOption === null ||
    transportOption === null ||
    mealOption === null ||
    extraOptions.some((option) => option === null)
  ) {
    return { status: 'unresolved-selection' };
  }

  return {
    status: 'ready',
    input: {
      scheduleId,
      participantCount,
      configuration: {
        style: tourStyle,
        hotelOption,
        transportOption,
        mealOption,
        extraOptions: extraOptions as ReservationExtraOption[],
      },
    },
  };
}
