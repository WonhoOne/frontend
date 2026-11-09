import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendEmployeeInventoryDataSource,
  MockEmployeeInventoryDataSource,
  type EmployeeInventoryDataSource,
} from '@/features/employee-inventory';

/**
 * Employee Inventory DataSource composition (CP7 A-6).
 * SECURITY: Mock은 DEV + 명시적 `VITE_ENABLE_MOCKS=true`에서만. 실패 시 Mock fallback 없음.
 */
function createEmployeeInventoryDataSource(): EmployeeInventoryDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockEmployeeInventoryDataSource([
      { itemType: 'COUPLE_TSHIRT', quantity: 12 },
      { itemType: 'GINSENG_GIFT', quantity: 0 },
      { itemType: 'GOLF_BALL', quantity: 35 },
      { itemType: 'SCARF', quantity: 8 },
    ]);
  }

  return new BackendEmployeeInventoryDataSource(backendHttpClient);
}

export const employeeInventoryDataSource = createEmployeeInventoryDataSource();
