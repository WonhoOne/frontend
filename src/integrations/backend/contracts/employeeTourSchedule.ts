import {
  expectArray,
  expectBoolean,
  expectEnum,
  expectIsoCalendarDate,
  expectNonNegativeInteger,
  expectPositiveInteger,
  expectRecord,
  expectString,
  mappingFailure,
} from '@/integrations/backend/contracts/decoder';
import {
  inventoryItemTypes,
  type InventoryItemTypeDto,
} from '@/integrations/backend/contracts/inventory';
import { tourThemes, type TourThemeDto } from '@/integrations/backend/contracts/tourProduct';

/*
 * v0.3 demo: Employee departure operations (`/api/v1/employee/tour-schedules/**`).
 *
 * CONTRACT: 운영 상태와 차감 결과는 Backend가 계산한 값이다. Frontend는 검증만 하고
 * 재고를 다시 계산하지 않는다.
 */
export const scheduleOperationStatuses = ['SCHEDULED', 'DEPARTED', 'COMPLETED'] as const;
export type ScheduleOperationStatusDto = (typeof scheduleOperationStatuses)[number];

/** `GET /api/v1/employee/tour-schedules` 항목. departure/completion 응답의 `schedule`과 같다. */
export interface EmployeeTourScheduleDto {
  id: number;
  tourId: number;
  tourName: string;
  theme: TourThemeDto;
  startDate: string;
  endDate: string;
  participantCount: number;
  confirmed: boolean;
  operationStatus: ScheduleOperationStatusDto;
}

/** 출발 처리로 차감된 기념품 한 종류. `remainingQuantity`는 차감 후 총 재고다. */
export interface DeductedInventoryItemDto {
  itemType: InventoryItemTypeDto;
  quantity: number;
  remainingQuantity: number;
}

export interface ScheduleDepartureDto {
  schedule: EmployeeTourScheduleDto;
  deductedItems: readonly DeductedInventoryItemDto[];
}

export interface ScheduleCompletionDto {
  schedule: EmployeeTourScheduleDto;
}

export function decodeEmployeeTourScheduleDto(
  value: unknown,
  rootPath = '$',
  contract:
    'EmployeeTourSchedule' | 'ScheduleDeparture' | 'ScheduleCompletion' = 'EmployeeTourSchedule',
): EmployeeTourScheduleDto {
  const record = expectRecord(value, contract, rootPath);
  const startDate = expectIsoCalendarDate(record.startDate, contract, rootPath + '.startDate');
  const endDate = expectIsoCalendarDate(record.endDate, contract, rootPath + '.endDate');

  if (startDate > endDate) {
    return mappingFailure(contract, rootPath, 'invalid-date-range');
  }

  return {
    id: expectPositiveInteger(record.id, contract, rootPath + '.id'),
    tourId: expectPositiveInteger(record.tourId, contract, rootPath + '.tourId'),
    tourName: expectString(record.tourName, contract, rootPath + '.tourName'),
    theme: expectEnum(record.theme, tourThemes, contract, rootPath + '.theme'),
    startDate,
    endDate,
    participantCount: expectNonNegativeInteger(
      record.participantCount,
      contract,
      rootPath + '.participantCount',
    ),
    confirmed: expectBoolean(record.confirmed, contract, rootPath + '.confirmed'),
    operationStatus: expectEnum(
      record.operationStatus,
      scheduleOperationStatuses,
      contract,
      rootPath + '.operationStatus',
    ),
  };
}

export function decodeEmployeeTourScheduleListDto(
  value: unknown,
): readonly EmployeeTourScheduleDto[] {
  return expectArray(value, 'EmployeeTourSchedule[]', '$').map((item, index) =>
    decodeEmployeeTourScheduleDto(item, `$[${index}]`),
  );
}

export function decodeScheduleDepartureDto(value: unknown): ScheduleDepartureDto {
  const contract = 'ScheduleDeparture' as const;
  const record = expectRecord(value, contract, '$');
  const deductedItems = expectArray(record.deductedItems, contract, '$.deductedItems').map(
    (item, index): DeductedInventoryItemDto => {
      const path = `$.deductedItems[${index}]`;
      const entry = expectRecord(item, contract, path);

      return {
        itemType: expectEnum(entry.itemType, inventoryItemTypes, contract, path + '.itemType'),
        quantity: expectNonNegativeInteger(entry.quantity, contract, path + '.quantity'),
        remainingQuantity: expectNonNegativeInteger(
          entry.remainingQuantity,
          contract,
          path + '.remainingQuantity',
        ),
      };
    },
  );

  if (new Set(deductedItems.map(({ itemType }) => itemType)).size !== deductedItems.length) {
    return mappingFailure(contract, '$.deductedItems', 'duplicate-value');
  }

  return {
    schedule: decodeEmployeeTourScheduleDto(record.schedule, '$.schedule', contract),
    deductedItems,
  };
}

export function decodeScheduleCompletionDto(value: unknown): ScheduleCompletionDto {
  const contract = 'ScheduleCompletion' as const;
  const record = expectRecord(value, contract, '$');

  return {
    schedule: decodeEmployeeTourScheduleDto(record.schedule, '$.schedule', contract),
  };
}
