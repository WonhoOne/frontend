import {
  expectBoolean,
  expectEnum,
  expectIntegerInRange,
  expectIsoCalendarDate,
  expectNonNegativeInteger,
  expectPositiveInteger,
  expectRecord,
  expectString,
  expectUniqueEnumArray,
  mappingFailure,
} from '@/integrations/backend/contracts/decoder';
import {
  tourStyles,
  tourThemes,
  type TourStyleDto,
  type TourThemeDto,
} from '@/integrations/backend/contracts/tourProduct';
import {
  recruitmentUnits,
  type RecruitmentUnitDto,
} from '@/integrations/backend/contracts/tourSchedule';

export const hotelOptions = ['HOTEL_3_STAR', 'HOTEL_4_STAR', 'HOTEL_5_STAR'] as const;
export type HotelOptionDto = (typeof hotelOptions)[number];

export const transportOptions = ['PRIVATE_LUXURY_CAR_2', 'PREMIUM_VAN_10'] as const;
export type TransportOptionDto = (typeof transportOptions)[number];

export const mealOptions = ['LUNCH_BOX', 'LOCAL_RESTAURANT', 'PREMIUM_RESTAURANT'] as const;
export type MealOptionDto = (typeof mealOptions)[number];

export const extraOptions = ['CHAMPAGNE', 'COFFEE'] as const;
export type ExtraOptionDto = (typeof extraOptions)[number];

export interface ReservationConfigurationDto {
  style: TourStyleDto;
  hotelOption: HotelOptionDto;
  transportOption: TransportOptionDto;
  mealOption: MealOptionDto;
  extraOptions: readonly ExtraOptionDto[];
}

export interface ReservationCreateRequestDto {
  scheduleId: number;
  participantCount: number;
  configuration: ReservationConfigurationDto;
}

export interface ReservationRecruitmentDto {
  unit: RecruitmentUnitDto;
  currentCount: number;
  requiredCount: number;
  confirmed: boolean;
}

export interface ReservationDiscountDto {
  type: 'LOYALTY';
  ratePercent: 5;
  amount: number;
}

export interface ReservationPriceDto {
  unitPrice: number;
  subtotal: number;
  discount: ReservationDiscountDto | null;
  total: number;
  currency: 'KRW';
}

export interface ReservationResponseDto {
  id: number;
  participantCount: number;
  tourProduct: {
    id: number;
    theme: TourThemeDto;
    name: string;
  };
  schedule: {
    id: number;
    startDate: string;
    endDate: string;
    recruitment: ReservationRecruitmentDto;
  };
  configuration: ReservationConfigurationDto;
  price: ReservationPriceDto;
}

function decodeConfiguration(value: unknown, path: string): ReservationConfigurationDto {
  const contract = 'Reservation' as const;
  const record = expectRecord(value, contract, path);

  return {
    style: expectEnum(record.style, tourStyles, contract, path + '.style'),
    hotelOption: expectEnum(record.hotelOption, hotelOptions, contract, path + '.hotelOption'),
    transportOption: expectEnum(
      record.transportOption,
      transportOptions,
      contract,
      path + '.transportOption',
    ),
    mealOption: expectEnum(record.mealOption, mealOptions, contract, path + '.mealOption'),
    extraOptions: expectUniqueEnumArray(
      record.extraOptions,
      extraOptions,
      contract,
      path + '.extraOptions',
    ),
  };
}

function decodeRecruitment(value: unknown, path: string): ReservationRecruitmentDto {
  const contract = 'Reservation' as const;
  const record = expectRecord(value, contract, path);

  return {
    unit: expectEnum(record.unit, recruitmentUnits, contract, path + '.unit'),
    currentCount: expectNonNegativeInteger(record.currentCount, contract, path + '.currentCount'),
    requiredCount: expectPositiveInteger(record.requiredCount, contract, path + '.requiredCount'),
    confirmed: expectBoolean(record.confirmed, contract, path + '.confirmed'),
  };
}

function decodeDiscount(value: unknown, path: string): ReservationDiscountDto | null {
  if (value === null) {
    return null;
  }

  const contract = 'Reservation' as const;
  const record = expectRecord(value, contract, path);

  return {
    type: expectEnum(record.type, ['LOYALTY'] as const, contract, path + '.type'),
    ratePercent: expectIntegerInRange(
      record.ratePercent,
      5,
      5,
      contract,
      path + '.ratePercent',
    ) as 5,
    amount: expectPositiveInteger(record.amount, contract, path + '.amount'),
  };
}

function decodePrice(value: unknown, path: string): ReservationPriceDto {
  const contract = 'Reservation' as const;
  const record = expectRecord(value, contract, path);

  if (record.currency !== 'KRW') {
    return mappingFailure(contract, path + '.currency', 'invalid-money');
  }

  return {
    unitPrice: expectPositiveInteger(record.unitPrice, contract, path + '.unitPrice'),
    subtotal: expectPositiveInteger(record.subtotal, contract, path + '.subtotal'),
    discount: decodeDiscount(record.discount, path + '.discount'),
    total: expectPositiveInteger(record.total, contract, path + '.total'),
    currency: 'KRW',
  };
}

export function decodeReservationResponseDto(value: unknown): ReservationResponseDto {
  const contract = 'Reservation' as const;
  const record = expectRecord(value, contract, '$');
  const tourProduct = expectRecord(record.tourProduct, contract, '$.tourProduct');
  const schedule = expectRecord(record.schedule, contract, '$.schedule');
  const startDate = expectIsoCalendarDate(schedule.startDate, contract, '$.schedule.startDate');
  const endDate = expectIsoCalendarDate(schedule.endDate, contract, '$.schedule.endDate');

  if (startDate > endDate) {
    return mappingFailure(contract, '$.schedule', 'invalid-date-range');
  }

  return {
    id: expectPositiveInteger(record.id, contract, '$.id'),
    participantCount: expectIntegerInRange(
      record.participantCount,
      1,
      10,
      contract,
      '$.participantCount',
    ),
    tourProduct: {
      id: expectPositiveInteger(tourProduct.id, contract, '$.tourProduct.id'),
      theme: expectEnum(tourProduct.theme, tourThemes, contract, '$.tourProduct.theme'),
      name: expectString(tourProduct.name, contract, '$.tourProduct.name'),
    },
    schedule: {
      id: expectPositiveInteger(schedule.id, contract, '$.schedule.id'),
      startDate,
      endDate,
      recruitment: decodeRecruitment(schedule.recruitment, '$.schedule.recruitment'),
    },
    configuration: decodeConfiguration(record.configuration, '$.configuration'),
    price: decodePrice(record.price, '$.price'),
  };
}
