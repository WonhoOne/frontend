import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';

import type { EmployeeInventoryDataSource } from '@/features/employee-inventory/EmployeeInventoryDataSource';
import {
  employeeInventoryQueryKey,
  useAddStock,
} from '@/features/employee-inventory/inventory.queries';
import { toStockAddOutcome } from '@/features/employee-inventory/inventoryErrors';
import type {
  InventoryItem,
  InventoryItemType,
} from '@/features/employee-inventory/inventory.model';
import styles from '@/features/employee-inventory/StockAddDialog.module.css';
import {
  checkStockQuantity,
  formatQuantity,
  inventoryItemLabel,
} from '@/features/employee-inventory/stockAddRules';
import { Button, Dialog, TextField } from '@/shared/ui';

interface StockAddDialogProps {
  dataSource: EmployeeInventoryDataSource;
  /** 열려 있는 품목. null이면 닫힘. */
  itemType: InventoryItemType | null;
  /** 표에 보이는 서버 현재 재고 (background refetch로 바뀔 수 있음) */
  currentQuantity: number | null;
  onClose: () => void;
  onAdded: (updated: InventoryItem, added: number) => void;
  /** 결과를 모른 채 dialog가 닫혔다. page가 안내하고 다시 읽는다. */
  onUnresolved: (itemType: InventoryItemType) => void;
  onForbidden: () => void;
}

type UnknownState = {
  before: number;
  attempted: number;
  now: number | null;
  checking: boolean;
  confirming: boolean;
};

/**
 * 재고 추가 dialog (E05, CP2-A V6 패턴: 현재 → 추가할 수량 → 추가 후 재고 → 확인).
 *
 * CONTRACT:
 * - 보내는 값은 더할 양수 수량뿐이다. 성공 후 화면은 서버가 돌려준 총 재고를 쓴다.
 * - "추가 후 재고"는 미리보기일 뿐 진실이 아니다.
 * - POST에 idempotency key가 없으므로 결과를 모르면 자동으로 다시 보내지 않는다.
 *   현재 재고를 다시 읽은 뒤에만, 확인을 거쳐 다시 추가할 수 있다 (CP5 §3.4).
 * - 요청 중에는 Escape/바깥 클릭으로 닫히지 않는다. 닫기 버튼은 Dialog 계약상 남는다.
 *   닫아도 요청은 취소되지 않고 결과는 page가 상태 줄로 알린다.
 */
export function StockAddDialog({
  currentQuantity,
  dataSource,
  itemType,
  onAdded,
  onClose,
  onForbidden,
  onUnresolved,
}: StockAddDialogProps) {
  const queryClient = useQueryClient();
  const addStock = useAddStock(dataSource);
  const [input, setInput] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [unknown, setUnknown] = useState<UnknownState | null>(null);
  const [openedWith, setOpenedWith] = useState<{
    itemType: InventoryItemType;
    quantity: number;
  } | null>(null);

  const [wasOpen, setWasOpen] = useState(false);
  const quantityInputId = useId();

  // ACCESSIBILITY: autoFocus를 쓰면 Dialog가 '닫을 때 돌아갈 곳'으로 입력칸을 기억해
  // 열었던 버튼으로 포커스가 돌아가지 않는다. Dialog가 opener를 기억한 다음 frame에
  // 입력칸으로 옮긴다.
  useEffect(() => {
    if (itemType === null) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(quantityInputId)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [itemType, quantityInputId]);
  const open = itemType !== null && currentQuantity !== null;

  // LIFECYCLE ('이전 render 정보' 패턴): 열릴 때마다 입력과 상태를 새로 시작한다.
  if (open && !wasOpen) {
    setWasOpen(true);
    setOpenedWith({ itemType, quantity: currentQuantity });
    setInput('');
    setFieldError(null);
    setAlert(null);
    setUnknown(null);
  }

  if (!open && wasOpen) {
    setWasOpen(false);
  }

  // 한 번도 열린 적이 없으면 그릴 것이 없다. 닫힌 뒤에는 Dialog를 open={false}로 남겨
  // Radix 닫기 과정(열었던 버튼으로 포커스 복귀)이 실행되게 한다.
  if (openedWith === null) {
    return null;
  }

  const activeItem = openedWith.itemType;
  const current = open ? currentQuantity : openedWith.quantity;
  const label = inventoryItemLabel(activeItem);
  const submitting = addStock.isPending;
  const check = checkStockQuantity(input, current);
  const changedElsewhere = unknown === null && current !== openedWith.quantity;

  async function send(quantity: number, before: number) {
    setFieldError(null);
    setAlert(null);

    try {
      const updated = await addStock.mutateAsync({ itemType: activeItem, quantity });
      setUnknown(null);
      onAdded(updated, quantity);
    } catch (error) {
      const outcome = toStockAddOutcome(error);

      switch (outcome.kind) {
        case 'validation':
          setFieldError('1개 이상 입력해 주세요.');
          break;
        case 'malformed':
          setAlert('요청을 처리할 수 없습니다.');
          break;
        case 'server':
          setAlert('재고를 추가하지 못했습니다.');
          void queryClient.invalidateQueries({ queryKey: employeeInventoryQueryKey });
          break;
        case 'forbidden':
          onForbidden();
          break;
        case 'session-expired':
          // 접근 경계가 다시 로그인 안내를 띄운다. 이 요청의 결과는 거부로 확정됐다.
          onClose();
          break;
        case 'unknown':
          setUnknown({
            before,
            attempted: quantity,
            now: null,
            checking: false,
            confirming: false,
          });
          break;
      }
    }
  }

  function submit() {
    if (!check.ok) {
      setFieldError(check.message);
      return;
    }

    void send(check.quantity, current);
  }

  async function recheck() {
    if (unknown === null) {
      return;
    }

    setUnknown({ ...unknown, checking: true, confirming: false });
    await queryClient.refetchQueries({ queryKey: employeeInventoryQueryKey });
    const list = queryClient.getQueryData<readonly InventoryItem[]>(employeeInventoryQueryKey);
    const now = list?.find((item) => item.itemType === activeItem)?.quantity ?? null;
    setUnknown({ ...unknown, now, checking: false, confirming: false });
  }

  function close() {
    if (unknown !== null || submitting) {
      onUnresolved(activeItem);
    }

    onClose();
  }

  const preview = check.ok ? formatQuantity(current + check.quantity) : '—';

  return (
    <Dialog
      closeLabel="닫기"
      closeOnEscape={!submitting}
      closeOnInteractOutside={!submitting}
      description={`${label}의 현재 재고에 받은 수량을 더합니다.`}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          close();
        }
      }}
      open={open}
      title={`${label} 재고 추가`}
    >
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <dl className={styles.summary}>
          <div>
            <dt>현재 재고</dt>
            <dd>{formatQuantity(unknown?.before ?? current)}</dd>
          </div>
        </dl>

        {changedElsewhere ? (
          <p className={styles.note}>다른 곳에서 재고가 바뀌어 현재 재고를 갱신했습니다.</p>
        ) : null}

        {unknown === null ? (
          <>
            <TextField
              {...(fieldError === null ? {} : { error: fieldError })}
              autoComplete="off"
              id={quantityInputId}
              inputMode="numeric"
              label="추가할 수량 (개)"
              onChange={(event) => setInput(event.target.value)}
              readOnly={submitting}
              required
              value={input}
            />

            <dl className={styles.summary}>
              <div>
                <dt>추가 후 재고</dt>
                <dd aria-live="polite">{preview}</dd>
              </div>
            </dl>

            {alert === null ? null : (
              <p className={styles.alert} role="alert">
                {alert}
              </p>
            )}

            <div className={styles.actions}>
              <Button onClick={close} variant="secondary">
                취소
              </Button>
              <Button isLoading={submitting} loadingLabel="추가 중" type="submit">
                추가
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.alert} role="alert">
            <p>추가가 반영되었는지 확인할 수 없습니다.</p>
            <p>
              시도 전 재고 {formatQuantity(unknown.before)}, 추가하려던 수량{' '}
              {formatQuantity(unknown.attempted)}
            </p>
            {unknown.now === null ? null : (
              <p>
                지금 재고 {formatQuantity(unknown.now)}.{' '}
                {unknown.now === unknown.before + unknown.attempted
                  ? '반영된 것으로 보입니다. 다른 직원이 동시에 추가했다면 다를 수 있습니다.'
                  : '시도 전과 비교해 확인해 주세요.'}
              </p>
            )}

            {unknown.confirming ? (
              <div className={styles.confirm}>
                <p>
                  같은 수량({formatQuantity(unknown.attempted)})이 한 번 더 더해질 수 있습니다. 다시
                  추가할까요?
                </p>
                <div className={styles.actions}>
                  <Button
                    onClick={() => setUnknown({ ...unknown, confirming: false })}
                    variant="secondary"
                  >
                    취소
                  </Button>
                  <Button
                    isLoading={submitting}
                    loadingLabel="추가 중"
                    onClick={() => void send(unknown.attempted, unknown.now ?? unknown.before)}
                  >
                    다시 추가
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.actions}>
                <Button
                  isLoading={unknown.checking}
                  loadingLabel="확인 중"
                  onClick={() => void recheck()}
                  variant="secondary"
                >
                  현재 재고 다시 보기
                </Button>
                <Button
                  disabled={unknown.now === null || unknown.checking}
                  onClick={() => setUnknown({ ...unknown, confirming: true })}
                  variant="quiet"
                >
                  다시 추가
                </Button>
              </div>
            )}
          </div>
        )}
      </form>
    </Dialog>
  );
}
