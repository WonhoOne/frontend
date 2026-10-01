export type { TravelHistoryDataSource } from '@/features/travel-history/TravelHistoryDataSource';
export {
  MockTravelHistoryDataSource,
  type MockTravelHistoryBehavior,
} from '@/features/travel-history/MockTravelHistoryDataSource';
export type {
  TravelHistoryItemModel,
  TravelHistoryPriceModel,
  TravelHistoryTourProductModel,
} from '@/features/travel-history/travelHistory.model';

export {
  travelHistoryQueryKey,
  travelHistoryQueryOptions,
  useTravelHistory,
} from '@/features/travel-history/travelHistory.query';

export { PreviousTripsPopup } from '@/features/travel-history/PreviousTripsPopup';
export {
  clearPostLoginHistoryIntent,
  consumePostLoginHistoryIntent,
  setPostLoginHistoryIntent,
  type PostLoginHistoryIntent,
} from '@/features/travel-history/postLoginHistoryIntent';
