import type { ConfigureFixtureScenario } from '@/features/configuration/configurationFixtures';
import type {
  ConfigurationCategory,
  OptionGroupModel,
  TripSummaryModel,
} from '@/features/configuration/configurationModels';
import {
  configurationGroupRetainsData,
  createReadyConfigureRuntimeState,
  type ConfigureRuntimeState,
} from '@/features/configuration/configureRuntimeState';
import {
  formatParticipantCountSummary,
  validateParticipantCount,
  type ParticipantCountRule,
  type ReservationDraftTourStyle,
  type ReservationDraftV1,
} from '@/features/reservation';

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

function runtimeSelectionLabel({
  category,
  group,
  runtimeState,
  selectionKey,
}: {
  category: ConfigurationCategory;
  group: OptionGroupModel | undefined;
  runtimeState: ConfigureRuntimeState;
  selectionKey: string | null;
}) {
  if (!configurationGroupRetainsData(runtimeState.groups[category])) {
    return null;
  }

  return optionLabel(group, selectionKey);
}

export function buildConfigureTripSummary({
  draft,
  participantRule,
  scenario,
  runtimeState = createReadyConfigureRuntimeState(),
}: {
  draft: ReservationDraftV1;
  participantRule: ParticipantCountRule;
  scenario: ConfigureFixtureScenario;
  runtimeState?: ConfigureRuntimeState;
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
      hotelLabel: runtimeSelectionLabel({
        category: 'hotel',
        group: groupFor(scenario.groups, 'hotel'),
        runtimeState,
        selectionKey: draft.configuration.hotelSelectionKey,
      }),
      transportLabel: runtimeSelectionLabel({
        category: 'transport',
        group: groupFor(scenario.groups, 'transport'),
        runtimeState,
        selectionKey: draft.configuration.transportSelectionKey,
      }),
      mealLabel: runtimeSelectionLabel({
        category: 'meal',
        group: groupFor(scenario.groups, 'meal'),
        runtimeState,
        selectionKey: draft.configuration.mealSelectionKey,
      }),
      extraLabels: configurationGroupRetainsData(runtimeState.groups.extras)
        ? draft.configuration.extraSelectionKeys.flatMap((selectionKey) => {
            const label = optionLabel(extrasGroup, selectionKey);
            return label === null ? [] : [label];
          })
        : [],
    },
    invalidSelections: (['hotel', 'transport', 'meal', 'extras'] as const).filter(
      (category) => runtimeState.groups[category].status === 'invalid',
    ),
  };
}
