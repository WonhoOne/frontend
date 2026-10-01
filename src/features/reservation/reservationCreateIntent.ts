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
 * Frontend Draft identity를 Shared v0.2 Reservation create intent로 변환하는 유일한 경계다.
 *
 * WHY: Draft의 string key를 Backend ID/canonical option이라고 암묵적으로 가정하면
 * PR-05 transaction identity가 wire contract로 굳어 버린다. resolver를 통해서만
 * scheduleId/canonical option으로 승격하고, price/customer/tour/theme은 request에 넣지 않는다.
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
