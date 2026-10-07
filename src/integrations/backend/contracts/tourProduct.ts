import {
  expectArray,
  expectEnum,
  expectPositiveInteger,
  expectRecord,
  expectString,
  expectUniqueEnumArray,
  mappingFailure,
} from '@/integrations/backend/contracts/decoder';

export const tourThemes = [
  'HONEYMOON_ROMANCE',
  'PARENTS_HEALING',
  'GOLF_CHALLENGE',
  'OUTDOOR_TREKKING',
] as const;

export type TourThemeDto = (typeof tourThemes)[number];

export const tourStyles = ['CLASSIC', 'GRAND', 'PREMIUM'] as const;

export type TourStyleDto = (typeof tourStyles)[number];

export interface TourStylePriceDto {
  style: TourStyleDto;
  amount: number;
  currency: 'KRW';
}

export interface TourProductDto {
  id: number;
  theme: TourThemeDto;
  name: string;
  description: string;
  availableStyles: readonly TourStyleDto[];
  stylePrices: readonly TourStylePriceDto[];
}

function decodeStylePrice(value: unknown, path: string): TourStylePriceDto {
  const contract = 'TourProduct' as const;
  const record = expectRecord(value, contract, path);
  const amount = expectPositiveInteger(record.amount, contract, `${path}.amount`);

  if (record.currency !== 'KRW') {
    return mappingFailure(contract, `${path}.currency`, 'invalid-money');
  }

  return {
    style: expectEnum(record.style, tourStyles, contract, `${path}.style`),
    amount,
    currency: 'KRW',
  };
}

export function decodeTourProductDto(value: unknown, rootPath = '$'): TourProductDto {
  const contract = 'TourProduct' as const;
  const record = expectRecord(value, contract, rootPath);
  const availableStyles = expectUniqueEnumArray(
    record.availableStyles,
    tourStyles,
    contract,
    `${rootPath}.availableStyles`,
  );
  const stylePrices = expectArray(record.stylePrices, contract, `${rootPath}.stylePrices`).map(
    (entry, index) => decodeStylePrice(entry, `${rootPath}.stylePrices[${index}]`),
  );

  const priceStyles = stylePrices.map((price) => price.style);
  const uniquePriceStyles = new Set(priceStyles);
  const availableStyleSet = new Set(availableStyles);

  if (
    uniquePriceStyles.size !== priceStyles.length ||
    uniquePriceStyles.size !== availableStyleSet.size ||
    priceStyles.some((style) => !availableStyleSet.has(style))
  ) {
    return mappingFailure(contract, `${rootPath}.stylePrices`, 'inconsistent-style-prices');
  }

  return {
    id: expectPositiveInteger(record.id, contract, `${rootPath}.id`),
    theme: expectEnum(record.theme, tourThemes, contract, `${rootPath}.theme`),
    name: expectString(record.name, contract, `${rootPath}.name`),
    description: expectString(record.description, contract, `${rootPath}.description`),
    availableStyles,
    stylePrices,
  };
}

export function decodeTourProductListDto(value: unknown): readonly TourProductDto[] {
  const contract = 'TourProduct[]' as const;

  return expectArray(value, contract, '$').map((entry, index) =>
    decodeTourProductDto(entry, `$[${index}]`),
  );
}
