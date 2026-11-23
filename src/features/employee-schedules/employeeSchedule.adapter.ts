import type {
  EmployeeSchedule,
  ScheduleDepartureResult,
} from '@/features/employee-schedules/employeeSchedule.model';
import type {
  EmployeeTourScheduleDto,
  ScheduleDepartureDto,
} from '@/integrations/backend/contracts';

export function adaptEmployeeSchedule(dto: EmployeeTourScheduleDto): EmployeeSchedule {
  return {
    id: dto.id,
    tourId: dto.tourId,
    tourName: dto.tourName,
    theme: dto.theme,
    startDate: dto.startDate,
    endDate: dto.endDate,
    participantCount: dto.participantCount,
    confirmed: dto.confirmed,
    operationStatus: dto.operationStatus,
  };
}

export function adaptScheduleDeparture(dto: ScheduleDepartureDto): ScheduleDepartureResult {
  return {
    schedule: adaptEmployeeSchedule(dto.schedule),
    deductedItems: dto.deductedItems.map((item) => ({
      itemType: item.itemType,
      quantity: item.quantity,
      remainingQuantity: item.remainingQuantity,
    })),
  };
}
