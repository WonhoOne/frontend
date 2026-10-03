import {
  expectArray,
  expectBoolean,
  expectEnum,
  expectIsoCalendarDate,
  expectNonNegativeInteger,
  expectPositiveInteger,
  expectRecord,
  mappingFailure,
} from '@/integrations/backend/contracts/decoder';

export const recruitmentUnits = ['PARTICIPANT', 'COUPLE_TEAM'] as const;

export type RecruitmentUnitDto = (typeof recruitmentUnits)[number];

export interface TourScheduleRecruitmentDto {
  unit: RecruitmentUnitDto;
  currentCount: number;
  requiredCount: number;
  confirmed: boolean;
}

export interface TourScheduleDto {
  id: number;
  tourId: number;
  startDate: string;
  endDate: string;
  reservable: boolean;
  recruitment: TourScheduleRecruitmentDto;
}

function decodeRecruitment(
  value: unknown,
  rootPath: string,
): TourScheduleRecruitmentDto {
  const contract = 'TourSchedule' as const;
  const record = expectRecord(value, contract, rootPath);

  return {
    unit: expectEnum(record.unit, recruitmentUnits, contract, `${rootPath}.unit`),
    currentCount: expectNonNegativeInteger(
      record.currentCount,
      contract,
      `${rootPath}.currentCount`,
    ),
    requiredCount: expectPositiveInteger(
      record.requiredCount,
      contract,
      `${rootPath}.requiredCount`,
    ),
    confirmed: expectBoolean(record.confirmed, contract, `${rootPath}.confirmed`),
  };
}

export function decodeTourScheduleDto(value: unknown, rootPath = '$'): TourScheduleDto {
  const contract = 'TourSchedule' as const;
  const record = expectRecord(value, contract, rootPath);
  const startDate = expectIsoCalendarDate(
    record.startDate,
    contract,
    `${rootPath}.startDate`,
  );
  const endDate = expectIsoCalendarDate(record.endDate, contract, `${rootPath}.endDate`);

  if (startDate > endDate) {
    return mappingFailure(contract, rootPath, 'invalid-date-range');
  }

  return {
    id: expectPositiveInteger(record.id, contract, `${rootPath}.id`),
    tourId: expectPositiveInteger(record.tourId, contract, `${rootPath}.tourId`),
    startDate,
    endDate,
    reservable: expectBoolean(record.reservable, contract, `${rootPath}.reservable`),
    recruitment: decodeRecruitment(record.recruitment, `${rootPath}.recruitment`),
  };
}

export function decodeTourScheduleListDto(value: unknown): readonly TourScheduleDto[] {
  const contract = 'TourSchedule[]' as const;

  return expectArray(value, contract, '$').map((entry, index) =>
    decodeTourScheduleDto(entry, `$[${index}]`),
  );
}
