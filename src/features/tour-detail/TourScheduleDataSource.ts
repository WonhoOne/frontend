import type { ScheduleChoiceModel } from '@/features/tour-detail/tourDetail.model';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export interface TourScheduleReadOptions {
  signal?: AbortSignal;
}

export interface TourScheduleDataSource {
  getTourSchedules(
    tourId: ResourceId,
    options?: TourScheduleReadOptions,
  ): Promise<readonly ScheduleChoiceModel[]>;
}
