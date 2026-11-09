import type { InventoryItem } from '@/features/employee-inventory/inventory.model';
import { INVENTORY_ITEM_ORDER } from '@/features/employee-inventory/stockAddRules';
import type { InventoryDto } from '@/integrations/backend/contracts';

/** 고정 4종이 정확히 한 번씩 오지 않으면 화면이 추측하지 않고 오류로 다룬다 (E05 §13). */
export class InventoryShapeError extends Error {
  override readonly name = 'InventoryShapeError';

  constructor() {
    super('Inventory response must contain each fixed item type exactly once.');
  }
}

export function adaptInventoryItem(dto: InventoryDto): InventoryItem {
  return { itemType: dto.itemType, quantity: dto.quantity };
}

/** CONTRACT: 순서는 Backend 응답(id 오름차순) 그대로 유지한다. */
export function adaptInventoryList(dtos: readonly InventoryDto[]): InventoryItem[] {
  const types = new Set(dtos.map((dto) => dto.itemType));

  if (dtos.length !== INVENTORY_ITEM_ORDER.length || types.size !== INVENTORY_ITEM_ORDER.length) {
    throw new InventoryShapeError();
  }

  return dtos.map(adaptInventoryItem);
}
