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
 * Frontend Draft identity를 Shared v0.2 Reservation create intent로 변환하는 유일한 경계다.
 *
 * Draft V2의 schedule identity는 이미 v0.2 canonical resource ID다.
 * Resolver는 아직 canonical Backend option contract가 없는 configuration selection만 해석한다.
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

  const hotelOption = resolver.resolveHotelOption(hotelSelectionKey);
  const transportOption = resolver.resolveTransportOption(transportSelectionKey);
  const mealOption = resolver.resolveMealOption(mealSelectionKey);
  const extraOptions = extraSelectionKeys.map((key) => resolver.resolveExtraOption(key));

  if (
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
      scheduleId: tourScheduleId,
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
