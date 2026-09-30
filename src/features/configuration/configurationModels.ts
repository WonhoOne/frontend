export const CONFIGURATION_GROUP_ORDER = ['hotel', 'transport', 'meal', 'extras'] as const;

export type ConfigurationCategory = (typeof CONFIGURATION_GROUP_ORDER)[number];

/**
 * Hotel/Transport/Meal은 source requirement상 single choice다.
 * Extras의 exact selection rule은 approved Shared Contract가 아직 닫지 않았으므로
 * C3에서는 multi-select로 확정하지 않는다.
 */
export type ConfigurationSelectionMode = 'single' | 'contract-dependent';

export type ConfigurationOptionAvailability =
  { status: 'selectable' } | { status: 'disabled'; reason: string };

export interface ConfigurationOptionVisualModel {
  src: string;
  alt: string;
}

/**
 * Configure UI가 소비하는 local presentation model.
 *
 * selectionKey는 Frontend transaction intent를 연결하기 위한 opaque key이며
 * Backend canonical option ID/DTO field라고 가정하지 않는다.
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
  price: PriceDisplayModel;
}
