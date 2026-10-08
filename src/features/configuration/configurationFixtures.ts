import {
  type ConfigurationCategory,
  type ConfigurationOptionModel,
  type OptionGroupModel,
  type TripSummaryModel,
} from '@/features/configuration/configurationModels';

export type ConfigurationFixtureSelectionKey = `fixture:${string}`;

export interface ConfigureScenario {
  source: 'fixture' | 'shared-contract';
  scenarioId: string;
  groups: readonly OptionGroupModel[];
  tripSummary: TripSummaryModel;
}

export interface ConfigureFixtureScenario extends ConfigureScenario {
  source: 'fixture';
}

function fixtureOption(
  category: ConfigurationCategory,
  suffix: string,
  title: string,
  description: string,
): ConfigurationOptionModel & { selectionKey: ConfigurationFixtureSelectionKey } {
  return {
    selectionKey: `fixture:${category}:${suffix}`,
    title,
    description,
    availability: { status: 'selectable' },
    visual: null,
  };
}

/**
 * C3 전용 contract-neutral fixture.
 *
 * IMPORTANT:
 * - 실제 Hotel/Transport/Meal/Extra catalog를 의미하지 않는다.
 * - key/title은 demo fixture이며 Backend canonical ID/name으로 재사용하지 않는다.
 * - 가격 truth가 승인되지 않았으므로 price는 unavailable로 둔다.
 */
export function createContractNeutralConfigureFixture(): ConfigureFixtureScenario {
  return {
    source: 'fixture',
    scenarioId: 'contract-neutral-default',
    groups: [
      {
        category: 'hotel',
        heading: 'Hotel',
        helperText: null,
        required: true,
        selectionMode: 'single',
        options: [
          fixtureOption('hotel', 'a', 'Fixture hotel A', 'Demo-only accommodation option.'),
          fixtureOption('hotel', 'b', 'Fixture hotel B', 'Demo-only accommodation option.'),
        ],
      },
      {
        category: 'transport',
        heading: 'Transport',
        helperText: null,
        required: true,
        selectionMode: 'single',
        options: [
          fixtureOption('transport', 'a', 'Fixture transport A', 'Demo-only transport option.'),
          fixtureOption('transport', 'b', 'Fixture transport B', 'Demo-only transport option.'),
        ],
      },
      {
        category: 'meal',
        heading: 'Meal',
        helperText: null,
        required: true,
        selectionMode: 'single',
        options: [
          fixtureOption('meal', 'a', 'Fixture meal A', 'Demo-only meal option.'),
          fixtureOption('meal', 'b', 'Fixture meal B', 'Demo-only meal option.'),
        ],
      },
      {
        category: 'extras',
        heading: 'Extras',
        helperText: 'Demo-only options, not the Shared v0.2 catalog.',
        required: false,
        selectionMode: 'multiple',
        options: [
          fixtureOption('extras', 'a', 'Fixture extra A', 'Demo-only additional option.'),
          fixtureOption('extras', 'b', 'Fixture extra B', 'Demo-only additional option.'),
        ],
      },
    ],
    tripSummary: {
      themeLabel: 'Fixture theme',
      styleLabel: 'Fixture style',
      scheduleLabel: 'Fixture schedule',
      participantLabel: null,
      selections: {
        hotelLabel: null,
        transportLabel: null,
        mealLabel: null,
        extraLabels: [],
      },
      invalidSelections: [],
      price: {
        state: 'unavailable',
        message: 'Price is not available in the contract-neutral fixture.',
      },
    },
  };
}

export function isConfigurationFixtureSelectionKey(
  selectionKey: string,
): selectionKey is ConfigurationFixtureSelectionKey {
  return selectionKey.startsWith('fixture:');
}
