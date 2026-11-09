import { useState } from 'react';

import { employeeInventoryDataSource } from '@/app/providers/employeeInventoryDataSource';
import { EmployeePageHeader } from '@/app/shell/EmployeePageHeader';
import { LoadingState, RefreshIndicator, SectionError } from '@/app/state';
import {
  formatQuantity,
  inventoryItemLabel,
  InventoryTable,
  isInventoryReadForbidden,
  isInventoryShapeProblem,
  StockAddDialog,
  useEmployeeInventory,
  type InventoryItemType,
} from '@/features/employee-inventory';
import styles from '@/pages/employee-inventory/EmployeeInventoryPage.module.css';
import { EmployeeAccessDenied } from '@/pages/employee-status/EmployeeAccessDenied';
import { PageContainer, Skeleton } from '@/shared/ui';

/**
 * 재고 관리 (E05).
 *
 * CONTRACT: 고정 4종의 현재 재고를 보여주고 양수 수량을 더하기만 한다 (BR-24/25).
 * 줄이거나 직접 바꾸는 기능은 없다. 성공 후 보이는 값은 서버가 계산한 총 재고다.
 */
export function EmployeeInventoryPage() {
  const inventory = useEmployeeInventory(employeeInventoryDataSource);
  const [openItem, setOpenItem] = useState<InventoryItemType | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<InventoryItemType | null>(null);
  const [forbidden, setForbidden] = useState(false);

  if (forbidden || (inventory.error !== null && isInventoryReadForbidden(inventory.error))) {
    return <EmployeeAccessDenied variant="forbidden" />;
  }

  const items = inventory.data;
  const openQuantity =
    openItem === null
      ? null
      : (items?.find((item) => item.itemType === openItem)?.quantity ?? null);

  return (
    <PageContainer>
      <EmployeePageHeader
        meta="받은 물품 수량을 더해 재고를 기록합니다. 재고를 줄이거나 직접 바꾸는 기능은 없습니다."
        title="재고 관리"
      />

      <div aria-live="polite" className={styles.statusRegion} role="status">
        {status === null ? null : <p className={styles.status}>{status}</p>}
      </div>

      {items === undefined ? (
        inventory.isError ? (
          <SectionError
            isRetrying={inventory.isFetching}
            onRetry={() => void inventory.refetch()}
            retryLabel="다시 시도"
            retryingLabel="다시 불러오는 중"
            title={
              isInventoryShapeProblem(inventory.error)
                ? '데이터 형식이 올바르지 않습니다'
                : '재고를 불러오지 못했습니다'
            }
          >
            <p>잠시 후 다시 시도해 주세요.</p>
          </SectionError>
        ) : (
          <LoadingState label="재고를 불러오고 있습니다">
            <div className={styles.skeleton}>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} style={{ blockSize: 56 }} />
              ))}
            </div>
          </LoadingState>
        )
      ) : (
        <>
          {inventory.isRefetchError ? (
            <p className={styles.refreshError}>
              최신 정보를 불러오지 못했습니다.{' '}
              <button
                className={styles.inlineRetry}
                onClick={() => void inventory.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </p>
          ) : inventory.isFetching ? (
            <RefreshIndicator label="최신 재고를 확인하고 있습니다" state="refreshing" />
          ) : null}

          <InventoryTable
            highlightedItem={highlighted}
            items={items}
            onAdd={(itemType) => {
              setStatus(null);
              setOpenItem(itemType);
            }}
          />
        </>
      )}

      <StockAddDialog
        currentQuantity={openQuantity}
        dataSource={employeeInventoryDataSource}
        itemType={openItem}
        onAdded={(updated, added) => {
          setOpenItem(null);
          setHighlighted(updated.itemType);
          setStatus(
            `${inventoryItemLabel(updated.itemType)} 재고를 ${formatQuantity(added)} 추가했습니다. 현재 ${formatQuantity(updated.quantity)}`,
          );
        }}
        onClose={() => setOpenItem(null)}
        onForbidden={() => setForbidden(true)}
        onUnresolved={() => {
          setStatus('재고 추가 결과를 확인하지 못했습니다. 현재 재고를 확인해 주세요.');
          void inventory.refetch();
        }}
      />
    </PageContainer>
  );
}
