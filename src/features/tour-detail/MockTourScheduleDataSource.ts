import type {
  TourScheduleDataSource,
  TourScheduleReadOptions,
} from '@/features/tour-detail/TourScheduleDataSource';
import { findTourDetailPreview } from '@/features/tour-detail/tourDetail.preview';
import { findTourSchedulePreview } from '@/features/tour-detail/tourSchedule.preview';
import { toCanonicalBackendResourceIdentity, type ResourceId } from '@/shared/lib/resourceIdentity';

export class MockTourScheduleDataSource implements TourScheduleDataSource {
  getTourSchedules(tourId: ResourceId, options: TourScheduleReadOptions = {}) {
    if (options.signal?.aborted === true) {
      return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
    }

    const tour = findTourDetailPreview(toCanonicalBackendResourceIdentity(tourId));
    if (tour === null) return Promise.resolve([]);

    const state = findTourSchedulePreview(tour);
    return Promise.resolve(state.status === 'ready' ? state.choices : []);
  }
}
