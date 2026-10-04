import type {
  TourScheduleDataSource,
  TourScheduleReadOptions,
} from '@/features/tour-detail/TourScheduleDataSource';
import { adaptTourScheduleDto } from '@/features/tour-detail/tourDetail.adapter';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { decodeTourScheduleListDto } from '@/integrations/backend/contracts';
import type { ResourceId } from '@/shared/lib/resourceIdentity';

export class BackendTourScheduleDataSource implements TourScheduleDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async getTourSchedules(tourId: ResourceId, options: TourScheduleReadOptions = {}) {
    const response = await this.client.requestJson({
      path: `/tour-schedules?tourId=${tourId}`,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    });

    return decodeTourScheduleListDto(response.body).map((dto) =>
      adaptTourScheduleDto(dto, tourId),
    );
  }
}
