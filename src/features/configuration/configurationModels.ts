export const CONFIGURATION_GROUP_ORDER = ['hotel', 'transport', 'meal', 'extras'] as const;

export type ConfigurationCategory = (typeof CONFIGURATION_GROUP_ORDER)[number];

/** Hotel/Transport/Meal use radio selection; Shared v0.2 Extras are optional multi-select. */
export type ConfigurationSelectionMode = 'single' | 'multiple';

export type ConfigurationOptionAvailability =
  { status: 'selectable' } | { status: 'disabled'; reason: string };

export interface ConfigurationOptionVisualModel {
  src: string;
  alt: string;
}

/**
 * Configure UI가 소비하는 local presentation model.
 *
 * selectionKey belongs to the scenario: Shared v0.2 uses canonical REST IDs;
 * historical fixture scenarios retain opaque demo-only selection keys.
 */
export interface ConfigurationOptionModel {
  selectionKey: string;
  title: string;
  description: string | null;
  availability: ConfigurationOptionAvailability;
  visual: ConfigurationOptionVisualModel | null;
}

export interface OptionGroupModel {
  category: ConfigurationCategory;
  heading: string;
  helperText: string | null;
  required: boolean;
  selectionMode: ConfigurationSelectionMode;
  options: readonly ConfigurationOptionModel[];
}

export type PriceDisplayModel =
  | {
      state: 'unavailable';
      message: string;
    }
  | {
      state: 'known';
      totalLabel: string;
    }
  | {
      state: 'loading';
      previousTotalLabel: string | null;
    }
  | {
      state: 'recalculating';
      previousTotalLabel: string;
    }
  | {
      state: 'error';
      previousTotalLabel: string | null;
      message: string;
    };

export interface TripSummarySelectionModel {
  hotelLabel: string | null;
  transportLabel: string | null;
  mealLabel: string | null;
  extraLabels: readonly string[];
}

export interface TripSummaryModel {
  themeLabel: string;
  styleLabel: string;
  scheduleLabel: string;
  participantLabel: string | null;
  selections: TripSummarySelectionModel;
  invalidSelections: readonly ConfigurationCategory[];
  price: PriceDisplayModel;
}
