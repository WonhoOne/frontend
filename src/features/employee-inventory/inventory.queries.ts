import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { EmployeeInventoryDataSource } from '@/features/employee-inventory/EmployeeInventoryDataSource';
import { shouldRetryInventoryRead } from '@/features/employee-inventory/inventoryErrors';
import type {
  InventoryItem,
  InventoryItemType,
} from '@/features/employee-inventory/inventory.model';

/** SECURITY: `'employee'`로 시작하는 private key. 로그아웃·401 때 비워진다. */
export const employeeInventoryQueryKey = ['employee', 'inventory'] as const;

export function useEmployeeInventory(dataSource: EmployeeInventoryDataSource) {
  return useQuery({
    queryKey: employeeInventoryQueryKey,
    queryFn: ({ signal }) => dataSource.listInventory(signal),
    staleTime: 0,
    meta: { privacy: 'private' },
    retry: shouldRetryInventoryRead,
  });
}

/**
 * 재고 추가는 비관적이고 자동 재시도하지 않는다 (CP5 §3.3).
 * 성공하면 서버가 돌려준 총 재고를 cache에 바로 쓰고, 목록을 다시 읽는다.
 */
export function useAddStock(dataSource: EmployeeInventoryDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemType, quantity }: { itemType: InventoryItemType; quantity: number }) =>
      dataSource.addStock(itemType, quantity),
    retry: 0,
    onSuccess: (updated: InventoryItem) => {
      queryClient.setQueryData<readonly InventoryItem[]>(employeeInventoryQueryKey, (current) =>
        current?.map((item) => (item.itemType === updated.itemType ? updated : item)),
      );
      return queryClient.invalidateQueries({ queryKey: employeeInventoryQueryKey });
    },
  });
}
