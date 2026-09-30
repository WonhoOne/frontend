import {
  formatParticipantCountSummary,
  validateParticipantCount,
  type ParticipantCountRule,
  type ReservationDraftTourStyle,
  type ReservationDraftV1,
} from '@/features/reservation';
import type { ConfigureFixtureScenario } from '@/features/configuration/configurationFixtures';
import type {
  ConfigurationCategory,
  OptionGroupModel,
  TripSummaryModel,
} from '@/features/configuration/configurationModels';

function styleLabel(style: ReservationDraftTourStyle | null): string {
  if (style === null) {
    return 'Style required';
  }

  return style.charAt(0) + style.slice(1).toLowerCase();
}

function groupFor(
  groups: readonly OptionGroupModel[],
  category: ConfigurationCategory,
): OptionGroupModel | undefined {
  return groups.find((group) => group.category === category);
}

function optionLabel(
  group: OptionGroupModel | undefined,
  selectionKey: string | null,
): string | null {
  if (selectionKey === null) {
    return null;
  }

  return group?.options.find((option) => option.selectionKey === selectionKey)?.title ?? null;
}

export function buildConfigureTripSummary({
  draft,
  participantRule,
  scenario,
}: {
  draft: ReservationDraftV1;
  participantRule: ParticipantCountRule;
  scenario: ConfigureFixtureScenario;
}): TripSummaryModel {
  const participantValidation = validateParticipantCount(participantRule, draft.participantCount);
  const extrasGroup = groupFor(scenario.groups, 'extras');

  return {
    ...scenario.tripSummary,
    styleLabel: styleLabel(draft.tourStyle),
    scheduleLabel:
      draft.tourScheduleId === null ? 'Schedule required' : scenario.tripSummary.scheduleLabel,
    participantLabel: formatParticipantCountSummary(participantValidation),
    selections: {
      hotelLabel: optionLabel(
        groupFor(scenario.groups, 'hotel'),
        draft.configuration.hotelSelectionKey,
      ),
      transportLabel: optionLabel(
        groupFor(scenario.groups, 'transport'),
        draft.configuration.transportSelectionKey,
      ),
      mealLabel: optionLabel(
        groupFor(scenario.groups, 'meal'),
        draft.configuration.mealSelectionKey,
      ),
      extraLabels: draft.configuration.extraSelectionKeys.flatMap((selectionKey) => {
        const label = optionLabel(extrasGroup, selectionKey);
        return label === null ? [] : [label];
      }),
    },
  };
}
