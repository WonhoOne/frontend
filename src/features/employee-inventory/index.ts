export { BackendEmployeeInventoryDataSource } from '@/features/employee-inventory/BackendEmployeeInventoryDataSource';
export type { EmployeeInventoryDataSource } from '@/features/employee-inventory/EmployeeInventoryDataSource';
export { MockEmployeeInventoryDataSource } from '@/features/employee-inventory/MockEmployeeInventoryDataSource';
export type {
  InventoryItem,
  InventoryItemType,
} from '@/features/employee-inventory/inventory.model';
export {
  employeeInventoryQueryKey,
  useAddStock,
  useEmployeeInventory,
} from '@/features/employee-inventory/inventory.queries';
export {
  isInventoryReadForbidden,
  isInventoryShapeProblem,
  toStockAddOutcome,
} from '@/features/employee-inventory/inventoryErrors';
export { InventoryTable } from '@/features/employee-inventory/InventoryTable';
export { StockAddDialog } from '@/features/employee-inventory/StockAddDialog';
export {
  checkStockQuantity,
  formatQuantity,
  inventoryItemLabel,
} from '@/features/employee-inventory/stockAddRules';
