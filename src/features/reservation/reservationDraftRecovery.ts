import type { ReservationDraftHydrationStatus } from '@/features/reservation/reservationDraftPersistence';
import { hasReservationDraftIntent } from '@/features/reservation/reservationDraftPersistence';
import type { ReservationDraftV1 } from '@/features/reservation/ReservationDraft';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export type ConfigureDraftEntryState =
  | { status: 'ready' }
  | { status: 'missing' }
  | { status: 'discarded' }
  | { status: 'incomplete' }
  | { status: 'route-mismatch'; savedTourProductId: ResourceId };

export type ReviewDraftHandoffState =
  | { status: 'ready'; tourProductId: ResourceId }
  | { status: 'missing' }
  | { status: 'discarded' }
  | { status: 'incomplete'; tourProductId: ResourceId | null };

function hasConfigureContext(draft: ReservationDraftV1) {
  return draft.tourProductId !== null && draft.tourStyle !== null && draft.tourScheduleId !== null;
}

function hasReviewHandoffIntent(draft: ReservationDraftV1) {
  return (
    hasConfigureContext(draft) &&
    draft.participantCount !== null &&
    draft.configuration.hotelSelectionKey !== null &&
    draft.configuration.transportSelectionKey !== null &&
    draft.configuration.mealSelectionKey !== null
  );
}

/**
 * Configure route가 Draft를 해석하는 recovery-only boundary다.
 *
 * Business validation을 다시 구현하지 않는다. 이 helper는 route identity와
 * 최소 transaction context만 판정하며, option/participant 최종 유효성은
 * Configure readiness와 Backend authority에 남긴다.
 */
export function getConfigureDraftEntryState({
  draft,
  hydrationStatus,
  routeTourProductId,
}: {
  draft: ReservationDraftV1;
  hydrationStatus: ReservationDraftHydrationStatus;
  routeTourProductId: ResourceId;
}): ConfigureDraftEntryState {
  if (hydrationStatus === 'discarded' && !hasReservationDraftIntent(draft)) {
    return { status: 'discarded' };
  }

  if (!hasReservationDraftIntent(draft)) {
    return { status: 'missing' };
  }

  if (draft.tourProductId !== null && draft.tourProductId !== routeTourProductId) {
    return {
      status: 'route-mismatch',
      savedTourProductId: draft.tourProductId,
    };
  }

  if (!hasConfigureContext(draft)) {
    return { status: 'incomplete' };
  }

  return { status: 'ready' };
}

/**
 * PR-06 Review 구현 전 route handoff guard.
 *
 * Review business validation/submit을 수행하지 않고, 현재 tab의 Draft가
 * locally complete한 handoff shape인지와 Configure 복귀 identity만 제공한다.
 */
export function getReviewDraftHandoffState({
  draft,
  hydrationStatus,
}: {
  draft: ReservationDraftV1;
  hydrationStatus: ReservationDraftHydrationStatus;
}): ReviewDraftHandoffState {
  if (hydrationStatus === 'discarded' && !hasReservationDraftIntent(draft)) {
    return { status: 'discarded' };
  }

  if (!hasReservationDraftIntent(draft)) {
    return { status: 'missing' };
  }

  if (!hasReviewHandoffIntent(draft) || draft.tourProductId === null) {
    return {
      status: 'incomplete',
      tourProductId: draft.tourProductId,
    };
  }

  return {
    status: 'ready',
    tourProductId: draft.tourProductId,
  };
}
