import type { TravelHistoryItemModel } from '@/features/travel-history/travelHistory.model';

export interface TravelHistoryDataSource {
  getTravelHistory(): Promise<readonly TravelHistoryItemModel[]>;
}
