export {
  CONFIGURATION_GROUP_ORDER,
  type ConfigurationCategory,
  type ConfigurationOptionAvailability,
  type ConfigurationOptionModel,
  type ConfigurationOptionVisualModel,
  type ConfigurationSelectionMode,
  type OptionGroupModel,
  type PriceDisplayModel,
  type TripSummaryModel,
  type TripSummarySelectionModel,
} from '@/features/configuration/configurationModels';
export {
  createContractNeutralConfigureFixture,
  isConfigurationFixtureSelectionKey,
  type ConfigurationFixtureSelectionKey,
  type ConfigureFixtureScenario,
  type ConfigureScenario,
} from '@/features/configuration/configurationFixtures';
export { createSharedContractConfigureScenario } from '@/features/configuration/sharedContractConfiguration';
export {
  configurationGroupBlocksReview,
  configurationGroupRetainsData,
  createReadyConfigureRuntimeState,
  type ConfigurationGroupRuntimeState,
  type ConfigureRuntimeState,
} from '@/features/configuration/configureRuntimeState';

export { ParticipantCountField } from '@/features/configuration/ParticipantCountField';

export { ConfigureDesktop } from '@/features/configuration/ConfigureDesktop';
export { ConfigurationOptionGroup } from '@/features/configuration/ConfigurationOptionGroup';
export { DesktopTripSummary } from '@/features/configuration/DesktopTripSummary';
export {
  getConfigureReadiness,
  type ConfigureReadiness,
  type ConfigureReadinessIssue,
} from '@/features/configuration/configureReadiness';
export { buildConfigureTripSummary } from '@/features/configuration/configurePresentation';
export { PriceSummary } from '@/features/configuration/PriceSummary';
export { getCompactPriceLabel } from '@/features/configuration/pricePresentation';

export { MobileTripSummary } from '@/features/configuration/MobileTripSummary';

export { buildPublicConfigurePrice } from '@/features/configuration/publicConfigurePrice';
