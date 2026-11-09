import {
  expectArray,
  expectEnum,
  expectNonNegativeInteger,
  expectPositiveInteger,
  expectRecord,
} from '@/integrations/backend/contracts/decoder';

/** REST v0.2 / domain model `InventoryItemType` 고정 4종. */
export const inventoryItemTypes = ['COUPLE_TSHIRT', 'GINSENG_GIFT', 'GOLF_BALL', 'SCARF'] as const;

export type InventoryItemTypeDto = (typeof inventoryItemTypes)[number];

/** `GET`/`POST /api/v1/employee/inventory` 응답 항목. `quantity`는 현재 총 재고다. */
export interface InventoryDto {
  id: number;
  itemType: InventoryItemTypeDto;
  quantity: number;
}

/** `POST /api/v1/employee/inventory` request body. `quantity`는 더할 양수 수량이다. */
export interface InventoryAddRequestDto {
  itemType: InventoryItemTypeDto;
  quantity: number;
}

/**
 * CONTRACT: id는 양의 safe integer, quantity는 0 이상의 safe integer다.
 * Backend는 Java `long`이지만 JS가 정확히 표현할 수 없는 값은 반올림하지 않고
 * ContractMappingError로 거부한다 (CP0-B §4, CP8 §4).
 */
export function decodeInventoryDto(value: unknown, rootPath = '$'): InventoryDto {
  const contract = 'Inventory' as const;
  const record = expectRecord(value, contract, rootPath);

  return {
    id: expectPositiveInteger(record.id, contract, rootPath + '.id'),
    itemType: expectEnum(record.itemType, inventoryItemTypes, contract, rootPath + '.itemType'),
    quantity: expectNonNegativeInteger(record.quantity, contract, rootPath + '.quantity'),
  };
}

export function decodeInventoryListDto(value: unknown): readonly InventoryDto[] {
  return expectArray(value, 'Inventory[]', '$').map((item, index) =>
    decodeInventoryDto(item, `$[${index}]`),
  );
}
