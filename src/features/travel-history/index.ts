export { BackendTravelHistoryDataSource } from '@/features/travel-history/BackendTravelHistoryDataSource';
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

export { PostLoginPreviousTripsSurface } from '@/features/travel-history/PostLoginPreviousTripsSurface';
export { PreviousTripsPopup } from '@/features/travel-history/PreviousTripsPopup';
export {
  clearPostLoginHistoryIntent,
  consumePostLoginHistoryIntent,
  setPostLoginHistoryIntent,
  usePostLoginHistoryIntent,
  type PostLoginHistoryIntent,
} from '@/features/travel-history/postLoginHistoryIntent';

export { isBrowserOffline } from '@/features/travel-history/browserConnectivity';
