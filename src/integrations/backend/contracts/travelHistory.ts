import {
  expectArray,
  expectEnum,
  expectIsoCalendarDate,
  expectPositiveInteger,
  expectRecord,
  expectString,
  mappingFailure,
} from '@/integrations/backend/contracts/decoder';
import {
  tourStyles,
  tourThemes,
  type TourStyleDto,
  type TourThemeDto,
} from '@/integrations/backend/contracts/tourProduct';

export interface TravelHistoryItemDto {
  reservationId: number;
  tourProduct: {
    id: number;
    theme: TourThemeDto;
    name: string;
  };
  startDate: string;
  endDate: string;
  style: TourStyleDto;
  price: {
    amount: number;
    currency: 'KRW';
  };
}

export function decodeTravelHistoryItemDto(
  value: unknown,
  rootPath = '$',
): TravelHistoryItemDto {
  const contract = 'TravelHistory' as const;
  const record = expectRecord(value, contract, rootPath);
  const tourProduct = expectRecord(record.tourProduct, contract, rootPath + '.tourProduct');
  const price = expectRecord(record.price, contract, rootPath + '.price');
  const startDate = expectIsoCalendarDate(record.startDate, contract, rootPath + '.startDate');
  const endDate = expectIsoCalendarDate(record.endDate, contract, rootPath + '.endDate');

  if (startDate > endDate) {
    return mappingFailure(contract, rootPath, 'invalid-date-range');
  }

  if (price.currency !== 'KRW') {
    return mappingFailure(contract, rootPath + '.price.currency', 'invalid-money');
  }

  return {
    reservationId: expectPositiveInteger(
      record.reservationId,
      contract,
      rootPath + '.reservationId',
    ),
    tourProduct: {
      id: expectPositiveInteger(tourProduct.id, contract, rootPath + '.tourProduct.id'),
      theme: expectEnum(tourProduct.theme, tourThemes, contract, rootPath + '.tourProduct.theme'),
      name: expectString(tourProduct.name, contract, rootPath + '.tourProduct.name'),
    },
    startDate,
    endDate,
    style: expectEnum(record.style, tourStyles, contract, rootPath + '.style'),
    price: {
      amount: expectPositiveInteger(price.amount, contract, rootPath + '.price.amount'),
      currency: 'KRW',
    },
  };
}

export function decodeTravelHistoryListDto(value: unknown): readonly TravelHistoryItemDto[] {
  const contract = 'TravelHistory[]' as const;

  return expectArray(value, contract, '$').map((entry, index) =>
    decodeTravelHistoryItemDto(entry, '$[' + index + ']'),
  );
}
