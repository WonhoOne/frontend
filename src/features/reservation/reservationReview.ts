import type { ReservationDraftV1 } from '@/features/reservation/ReservationDraft';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export interface ReservationReviewSelectionResolver {
  tourProductLabel(tourProductId: ResourceId): string;
  scheduleLabel(scheduleId: ResourceId): string;
  optionLabel(selectionKey: string): string;
}

export interface ReservationReviewModel {
  tourProductId: ResourceId;
  tourProductLabel: string;
  styleLabel: string;
  scheduleLabel: string;
  participantLabel: string;
  hotelLabel: string;
  transportLabel: string;
  mealLabel: string;
  extraLabels: readonly string[];
  price: {
    status: 'finalized-on-create';
    message: string;
  };
}

/**
 * Review는 Draft를 수정하지 않는 read-only projection이다.
 * opaque selection identity를 화면 문구로 직접 노출하지 않고 resolver를 통해 표시한다.
 *
 * v0.2에서 final price는 POST /reservations 성공 시 Backend가 확정하므로
 * Review 단계에서 Frontend가 total/discount를 계산하지 않는다.
 */
export function createReservationReviewModel(
  draft: ReservationDraftV1,
  resolver: ReservationReviewSelectionResolver,
): ReservationReviewModel | null {
  if (
    draft.tourProductId === null ||
    draft.tourScheduleId === null ||
    draft.tourStyle === null ||
    draft.participantCount === null ||
    draft.configuration.hotelSelectionKey === null ||
    draft.configuration.transportSelectionKey === null ||
    draft.configuration.mealSelectionKey === null
  ) {
    return null;
  }

  return {
    tourProductId: draft.tourProductId,
    tourProductLabel: resolver.tourProductLabel(draft.tourProductId),
    styleLabel: draft.tourStyle.charAt(0) + draft.tourStyle.slice(1).toLowerCase(),
    scheduleLabel: resolver.scheduleLabel(draft.tourScheduleId),
    participantLabel: `${draft.participantCount} participants`,
    hotelLabel: resolver.optionLabel(draft.configuration.hotelSelectionKey),
    transportLabel: resolver.optionLabel(draft.configuration.transportSelectionKey),
    mealLabel: resolver.optionLabel(draft.configuration.mealSelectionKey),
    extraLabels: draft.configuration.extraSelectionKeys.map((key) => resolver.optionLabel(key)),
    price: {
      status: 'finalized-on-create',
      message: 'Final price and any loyalty discount are confirmed by the server when you apply.',
    },
  };
}

/**
 * Current PR-05 Configure fixture를 Review에서 사람이 읽을 수 있게 보존하는 preview resolver.
 * canonical Backend option ID라고 주장하지 않는다.
 */
export const previewReservationReviewResolver: ReservationReviewSelectionResolver = {
  tourProductLabel: () => 'Selected tour',
  scheduleLabel: () => 'Selected schedule',
  optionLabel: (key) => {
    const labels: Record<string, string> = {
      'fixture:hotel:a': 'Fixture hotel A',
      'fixture:hotel:b': 'Fixture hotel B',
      'fixture:transport:a': 'Fixture transport A',
      'fixture:transport:b': 'Fixture transport B',
      'fixture:meal:a': 'Fixture meal A',
      'fixture:meal:b': 'Fixture meal B',
      'fixture:extras:a': 'Fixture extra A',
      'fixture:extras:b': 'Fixture extra B',
    };
    return labels[key] ?? 'Selected option';
  },
};
