import type {
  TourScheduleDataSource,
  TourScheduleReadOptions,
} from '@/features/tour-detail/TourScheduleDataSource';
import { findTourDetailPreview } from '@/features/tour-detail/tourDetail.preview';
import { findTourSchedulePreview } from '@/features/tour-detail/tourSchedule.preview';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export class MockTourScheduleDataSource implements TourScheduleDataSource {
  async getTourSchedules(tourId: ResourceId, options: TourScheduleReadOptions = {}) {
    if (options.signal?.aborted === true) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    const tour = findTourDetailPreview(tourId);
    if (tour === null) return [];

    const state = findTourSchedulePreview(tour);
    return state.status === 'ready' ? state.choices : [];
  }
}
