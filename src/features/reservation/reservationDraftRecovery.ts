import type { ReservationDraftHydrationStatus } from '@/features/reservation/reservationDraftPersistence';
import { hasReservationDraftIntent } from '@/features/reservation/reservationDraftPersistence';
import type { ReservationDraftV1 } from '@/features/reservation/ReservationDraft';

export type ConfigureDraftEntryState =
  | { status: 'ready' }
  | { status: 'missing' }
  | { status: 'discarded' }
  | { status: 'incomplete' }
  | { status: 'route-mismatch'; savedTourProductId: string };

export type ReviewDraftHandoffState =
  | { status: 'ready'; tourProductId: string }
  | { status: 'missing' }
  | { status: 'discarded' }
  | { status: 'incomplete'; tourProductId: string | null };

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

export function getConfigureDraftEntryState({
  draft,
  hydrationStatus,
  routeTourProductId,
}: {
  draft: ReservationDraftV1;
  hydrationStatus: ReservationDraftHydrationStatus;
  routeTourProductId: string;
}): ConfigureDraftEntryState {
  if (hydrationStatus === 'discarded' && !hasReservationDraftIntent(draft)) {
    return { status: 'discarded' };
  }

  if (!hasReservationDraftIntent(draft)) {
    return { status: 'missing' };
  }

  if (draft.tourProductId !== null && draft.tourProductId !== routeTourProductId) {
    return { status: 'route-mismatch', savedTourProductId: draft.tourProductId };
  }

  if (!hasConfigureContext(draft)) {
    return { status: 'incomplete' };
  }

  return { status: 'ready' };
}

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
    return { status: 'incomplete', tourProductId: draft.tourProductId };
  }

  return { status: 'ready', tourProductId: draft.tourProductId };
}
