import type { TravelHistoryDataSource } from '@/features/travel-history/TravelHistoryDataSource';
import type { TravelHistoryItemModel } from '@/features/travel-history/travelHistory.model';

export interface MockTravelHistoryBehavior {
  getTravelHistory(): Promise<readonly TravelHistoryItemModel[]>;
}

/**
 * PR-08 mock-backed source. Fixtures are injected by tests/composition so the
 * feature does not ship invented customer history as contract data.
 */
export class MockTravelHistoryDataSource implements TravelHistoryDataSource {
  constructor(private readonly behavior: MockTravelHistoryBehavior) {}

  getTravelHistory() {
    return this.behavior.getTravelHistory();
  }
}
