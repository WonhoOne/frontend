import styles from '@/features/employee-inventory/InventoryTable.module.css';
import type {
  InventoryItem,
  InventoryItemType,
} from '@/features/employee-inventory/inventory.model';
import { formatQuantity, inventoryItemLabel } from '@/features/employee-inventory/stockAddRules';
import { Button } from '@/shared/ui';

interface InventoryTableProps {
  items: readonly InventoryItem[];
  onAdd: (itemType: InventoryItemType) => void;
  highlightedItem?: InventoryItemType | null;
}

/**
 * 고정 4종 현재 재고 (E05 §5).
 * CONTRACT: 표 안에서 수량을 직접 고치는 칸은 없다. 추가만 dialog로 한다 (CP2-A V5 거부).
 */
export function InventoryTable({ highlightedItem = null, items, onAdd }: InventoryTableProps) {
  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <caption className={styles.caption}>물품별 현재 재고</caption>
        <thead>
          <tr>
            <th scope="col">품목</th>
            <th className={styles.numeric} scope="col">
              현재 재고
            </th>
            <th scope="col">
              <span className={styles.caption}>작업</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const label = inventoryItemLabel(item.itemType);

            return (
              <tr
                className={item.itemType === highlightedItem ? styles.highlighted : undefined}
                data-item-type={item.itemType}
                key={item.itemType}
              >
                <th scope="row">{label}</th>
                <td className={styles.numeric}>{formatQuantity(item.quantity)}</td>
                <td className={styles.action}>
                  <Button
                    aria-label={`${label} 재고 추가`}
                    data-stock-add-for={item.itemType}
                    onClick={() => onAdd(item.itemType)}
                    size="small"
                    variant="secondary"
                  >
                    재고 추가
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
