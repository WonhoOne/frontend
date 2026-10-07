import type {
  TourScheduleDataSource,
  TourScheduleReadOptions,
} from '@/features/tour-detail/TourScheduleDataSource';
import { adaptTourScheduleDto } from '@/features/tour-detail/tourDetail.adapter';
import { BackendRequestAbortedError } from '@/integrations/backend/client/backendHttpError';
import {
  getPublicTourScheduleDtoFixtures,
  PUBLIC_READ_MOCK_ONLY_SENTINEL,
} from '@/mocks/publicReadFixtures';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export class MockTourScheduleDataSource implements TourScheduleDataSource {
  readonly mockRuntimeSentinel = PUBLIC_READ_MOCK_ONLY_SENTINEL;

  getTourSchedules(tourId: ResourceId, options: TourScheduleReadOptions = {}) {
    if (options.signal?.aborted === true) {
      return Promise.reject(new BackendRequestAbortedError());
    }

    return Promise.resolve(
      getPublicTourScheduleDtoFixtures(tourId).map((schedule) =>
        adaptTourScheduleDto(schedule, tourId),
      ),
    );
  }
}
