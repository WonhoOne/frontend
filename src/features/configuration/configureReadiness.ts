import {
  validateParticipantCount,
  type ParticipantCountRule,
  type ReservationDraftV1,
} from '@/features/reservation';
import type { OptionGroupModel } from '@/features/configuration/configurationModels';

export type ConfigureReadinessIssue =
  'tour-context' | 'style' | 'schedule' | 'participants' | 'hotel' | 'transport' | 'meal';

export interface ConfigureReadiness {
  isReady: boolean;
  issues: readonly ConfigureReadinessIssue[];
}

function hasSelectableSelection(
  group: OptionGroupModel | undefined,
  selectionKey: string | null,
): boolean {
  if (group === undefined || selectionKey === null) {
    return false;
  }

  return group.options.some(
    (option) => option.selectionKey === selectionKey && option.availability.status === 'selectable',
  );
}

/**
 * Configure → Review 이동 전에 확인할 Frontend-local completeness만 판정한다.
 *
 * CONTRACT:
 * - Backend final validation authority를 대체하지 않는다.
 * - availability/capacity/price business rule을 재계산하지 않는다.
 * - 현재 보이는 selectable option과 Draft의 required selection이 일치하는지만 확인한다.
 */
export function getConfigureReadiness({
  draft,
  expectedTourProductId,
  groups,
  participantRule,
}: {
  draft: ReservationDraftV1;
  expectedTourProductId: string;
  groups: readonly OptionGroupModel[];
  participantRule: ParticipantCountRule;
}): ConfigureReadiness {
  const issues: ConfigureReadinessIssue[] = [];

  if (draft.tourProductId !== expectedTourProductId) {
    issues.push('tour-context');
  }

  if (draft.tourStyle === null) {
    issues.push('style');
  }

  if (draft.tourScheduleId === null) {
    issues.push('schedule');
  }

  if (validateParticipantCount(participantRule, draft.participantCount).status !== 'valid') {
    issues.push('participants');
  }

  const hotelGroup = groups.find((group) => group.category === 'hotel');
  if (!hasSelectableSelection(hotelGroup, draft.configuration.hotelSelectionKey)) {
    issues.push('hotel');
  }

  const transportGroup = groups.find((group) => group.category === 'transport');
  if (!hasSelectableSelection(transportGroup, draft.configuration.transportSelectionKey)) {
    issues.push('transport');
  }

  const mealGroup = groups.find((group) => group.category === 'meal');
  if (!hasSelectableSelection(mealGroup, draft.configuration.mealSelectionKey)) {
    issues.push('meal');
  }

  return {
    isReady: issues.length === 0,
    issues,
  };
}
