import type { OptionGroupModel } from '@/features/configuration/configurationModels';
import {
  configurationGroupBlocksReview,
  createReadyConfigureRuntimeState,
  type ConfigureRuntimeState,
} from '@/features/configuration/configureRuntimeState';
import {
  validateParticipantCount,
  type ParticipantCountRule,
  type ReservationDraftV1,
} from '@/features/reservation';

export type ConfigureReadinessIssue =
  | 'tour-context'
  | 'style'
  | 'schedule'
  | 'participants'
  | 'hotel'
  | 'transport'
  | 'meal'
  | 'extras';

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

function requiredGroupIsReady({
  category,
  group,
  runtimeState,
  selectionKey,
}: {
  category: 'hotel' | 'transport' | 'meal';
  group: OptionGroupModel | undefined;
  runtimeState: ConfigureRuntimeState;
  selectionKey: string | null;
}) {
  if (group === undefined || configurationGroupBlocksReview(runtimeState.groups[category], true)) {
    return false;
  }

  return hasSelectableSelection(group, selectionKey);
}

/**
 * Configure → Review 이동 전에 확인할 Frontend-local completeness만 판정한다.
 *
 * CONTRACT:
 * - Backend final validation authority를 대체하지 않는다.
 * - availability/capacity/price business rule을 재계산하지 않는다.
 * - 현재 보이는 selectable option과 known blocking runtime state만 확인한다.
 * - refreshing/stale/offline policy를 임의로 blocking rule로 만들지 않는다.
 */
export function getConfigureReadiness({
  draft,
  expectedTourProductId,
  groups,
  participantRule,
  runtimeState = createReadyConfigureRuntimeState(),
}: {
  draft: ReservationDraftV1;
  expectedTourProductId: string;
  groups: readonly OptionGroupModel[];
  participantRule: ParticipantCountRule;
  runtimeState?: ConfigureRuntimeState;
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
  if (
    !requiredGroupIsReady({
      category: 'hotel',
      group: hotelGroup,
      runtimeState,
      selectionKey: draft.configuration.hotelSelectionKey,
    })
  ) {
    issues.push('hotel');
  }

  const transportGroup = groups.find((group) => group.category === 'transport');
  if (
    !requiredGroupIsReady({
      category: 'transport',
      group: transportGroup,
      runtimeState,
      selectionKey: draft.configuration.transportSelectionKey,
    })
  ) {
    issues.push('transport');
  }

  const mealGroup = groups.find((group) => group.category === 'meal');
  if (
    !requiredGroupIsReady({
      category: 'meal',
      group: mealGroup,
      runtimeState,
      selectionKey: draft.configuration.mealSelectionKey,
    })
  ) {
    issues.push('meal');
  }

  // Extras are optional, but an already-selected unavailable Extra cannot
  // be submitted as though it were valid. Clearing it restores Review access.
  const selectedExtras = draft.configuration.extraSelectionKeys;
  if (selectedExtras.length > 0) {
    const extrasGroup = groups.find((group) => group.category === 'extras');
    if (
      runtimeState.groups.extras.status === 'invalid' ||
      selectedExtras.some((key) => !hasSelectableSelection(extrasGroup, key))
    ) {
      issues.push('extras');
    }
  }

  return {
    isReady: issues.length === 0,
    issues,
  };
}
