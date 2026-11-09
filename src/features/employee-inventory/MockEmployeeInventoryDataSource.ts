import type { EmployeeInventoryDataSource } from '@/features/employee-inventory/EmployeeInventoryDataSource';
import type {
  InventoryItem,
  InventoryItemType,
} from '@/features/employee-inventory/inventory.model';

/**
 * DEV(`VITE_ENABLE_MOCKS=true`)와 테스트용 in-memory 구현. 더하기만 한다 (BR-25).
 * Synthetic data only. Production build에는 composition root가 포함하지 않는다.
 */
export class MockEmployeeInventoryDataSource implements EmployeeInventoryDataSource {
  private items: InventoryItem[];

  constructor(seed: readonly InventoryItem[]) {
    this.items = seed.map((item) => ({ ...item }));
  }

  listInventory() {
    return Promise.resolve(this.items.map((item) => ({ ...item })));
  }

  addStock(itemType: InventoryItemType, quantity: number) {
    this.items = this.items.map((item) =>
      item.itemType === itemType ? { ...item, quantity: item.quantity + quantity } : item,
    );
    const updated = this.items.find((item) => item.itemType === itemType);

    return updated === undefined
      ? Promise.reject(new Error(`Unknown item type ${itemType}`))
      : Promise.resolve({ ...updated });
  }
}
