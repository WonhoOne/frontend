import type { EmployeeInventoryDataSource } from '@/features/employee-inventory/EmployeeInventoryDataSource';
import {
  adaptInventoryItem,
  adaptInventoryList,
} from '@/features/employee-inventory/inventory.adapter';
import type { InventoryItemType } from '@/features/employee-inventory/inventory.model';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import {
  decodeInventoryDto,
  decodeInventoryListDto,
  type InventoryAddRequestDto,
} from '@/integrations/backend/contracts';

/**
 * REST v0.2 Employee Inventory endpoint.
 * SECURITY: Bearer는 중앙 client만 붙인다. 화면별 fetch를 만들지 않는다.
 */
export class BackendEmployeeInventoryDataSource implements EmployeeInventoryDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async listInventory(signal?: AbortSignal) {
    const response = await this.client.requestJson({
      path: '/employee/inventory',
      authentication: 'required',
      ...(signal === undefined ? {} : { signal }),
    });

    return adaptInventoryList(decodeInventoryListDto(response.body));
  }

  async addStock(itemType: InventoryItemType, quantity: number) {
    const body: InventoryAddRequestDto = { itemType, quantity };
    const response = await this.client.requestJson({
      path: '/employee/inventory',
      method: 'POST',
      authentication: 'required',
      body,
    });

    return adaptInventoryItem(decodeInventoryDto(response.body));
  }
}
