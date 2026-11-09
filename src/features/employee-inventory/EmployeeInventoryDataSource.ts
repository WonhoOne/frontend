import type {
  InventoryItem,
  InventoryItemType,
} from '@/features/employee-inventory/inventory.model';

/** 직원 재고 server boundary. 조회와 양수 추가만 있다 (BR-24/25). */
export interface EmployeeInventoryDataSource {
  listInventory(signal?: AbortSignal): Promise<readonly InventoryItem[]>;
  /** `quantity`는 더할 양. 응답은 서버가 계산한 새 총 재고다. */
  addStock(itemType: InventoryItemType, quantity: number): Promise<InventoryItem>;
}
