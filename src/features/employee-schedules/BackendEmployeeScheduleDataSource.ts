import type { EmployeeScheduleDataSource } from '@/features/employee-schedules/EmployeeScheduleDataSource';
import {
  adaptEmployeeSchedule,
  adaptScheduleDeparture,
} from '@/features/employee-schedules/employeeSchedule.adapter';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import {
  ContractMappingError,
  decodeEmployeeTourScheduleListDto,
  decodeScheduleCompletionDto,
  decodeScheduleDepartureDto,
} from '@/integrations/backend/contracts';
import { serializeResourceId } from '@/shared/lib/resourceIdentity';

/**
 * v0.3 demo Employee tour-schedule endpoints.
 * SECURITY: Bearer는 중앙 client만 붙인다. 화면별 fetch를 만들지 않는다.
 */
export class BackendEmployeeScheduleDataSource implements EmployeeScheduleDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async listSchedules(signal?: AbortSignal) {
    const response = await this.client.requestJson({
      path: '/employee/tour-schedules',
      authentication: 'required',
      ...(signal === undefined ? {} : { signal }),
    });

    return decodeEmployeeTourScheduleListDto(response.body).map(adaptEmployeeSchedule);
  }

  async markDeparted(scheduleId: number) {
    const response = await this.client.requestJson({
      path: `/employee/tour-schedules/${serializeResourceId(scheduleId)}/departure`,
      method: 'POST',
      authentication: 'required',
    });
    const dto = decodeScheduleDepartureDto(response.body);

    if (dto.schedule.id !== scheduleId) {
      throw new ContractMappingError(
        'ScheduleDeparture',
        '$.schedule.id',
        'resource-identity-mismatch',
      );
    }

    return adaptScheduleDeparture(dto);
  }

  async markCompleted(scheduleId: number) {
    const response = await this.client.requestJson({
      path: `/employee/tour-schedules/${serializeResourceId(scheduleId)}/completion`,
      method: 'POST',
      authentication: 'required',
    });
    const dto = decodeScheduleCompletionDto(response.body);

    if (dto.schedule.id !== scheduleId) {
      throw new ContractMappingError(
        'ScheduleCompletion',
        '$.schedule.id',
        'resource-identity-mismatch',
      );
    }

    return adaptEmployeeSchedule(dto.schedule);
  }
}
