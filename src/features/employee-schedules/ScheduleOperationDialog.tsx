import { useState } from 'react';

import { formatQuantity, inventoryItemLabel } from '@/features/employee-inventory/stockAddRules';
import styles from '@/features/employee-schedules/ScheduleOperationDialog.module.css';
import type { EmployeeScheduleDataSource } from '@/features/employee-schedules/EmployeeScheduleDataSource';
import type {
  EmployeeSchedule,
  ScheduleDepartureResult,
} from '@/features/employee-schedules/employeeSchedule.model';
import {
  useMarkCompleted,
  useMarkDeparted,
} from '@/features/employee-schedules/employeeSchedule.queries';
import {
  scheduleOperationMessage,
  toScheduleOperationOutcome,
} from '@/features/employee-schedules/employeeScheduleErrors';
import {
  expectedDeduction,
  formatScheduleDates,
} from '@/features/employee-schedules/scheduleRules';
import { Button, Dialog } from '@/shared/ui';

export type ScheduleOperation = { kind: 'depart' | 'complete'; schedule: EmployeeSchedule };

interface ScheduleOperationDialogProps {
  dataSource: EmployeeScheduleDataSource;
  /** 확인할 작업. null이면 닫힘. */
  operation: ScheduleOperation | null;
  onClose: () => void;
  onDeparted: (result: ScheduleDepartureResult) => void;
  onCompleted: (schedule: EmployeeSchedule) => void;
  /** 거절되었거나 결과를 모른다. page가 목록을 다시 읽는다. */
  onStale: () => void;
  onForbidden: () => void;
}

/**
 * 출발/완료 처리 확인 dialog (v0.3 demo, scenario 3).
 *
 * CONTRACT:
 * - 확인 버튼을 눌러야만 요청한다. 자동 재시도하지 않는다.
 * - 예상 차감량은 미리보기다. 성공 후에는 서버가 돌려준 차감 결과만 쓴다.
 * - 요청 중에는 Escape/바깥 클릭으로 닫히지 않는다.
 */
export function ScheduleOperationDialog({
  dataSource,
  onClose,
  onCompleted,
  onDeparted,
  onForbidden,
  onStale,
  operation,
}: ScheduleOperationDialogProps) {
  const depart = useMarkDeparted(dataSource);
  const complete = useMarkCompleted(dataSource);
  const [alert, setAlert] = useState<string | null>(null);
  const [shown, setShown] = useState<ScheduleOperation | null>(operation);

  // LIFECYCLE ('이전 render 정보' 패턴): 새 작업이 열리면 상태를 새로 시작한다.
  // 닫힌 뒤에도 마지막 작업을 남겨 Radix 닫기 과정(포커스 복귀)이 실행되게 한다.
  if (operation !== null && operation !== shown) {
    setShown(operation);
    setAlert(null);
  }

  if (shown === null) {
    return null;
  }

  const { kind, schedule } = shown;
  const submitting = depart.isPending || complete.isPending;
  const deduction = expectedDeduction(schedule);

  async function confirm() {
    setAlert(null);

    try {
      if (kind === 'depart') {
        onDeparted(await depart.mutateAsync(schedule.id));
      } else {
        onCompleted(await complete.mutateAsync(schedule.id));
      }
    } catch (error) {
      const outcome = toScheduleOperationOutcome(error);

      if (outcome.kind === 'forbidden') {
        onForbidden();
        return;
      }

      if (outcome.kind === 'session-expired') {
        // 접근 경계가 다시 로그인 안내를 띄운다.
        onClose();
        return;
      }

      setAlert(scheduleOperationMessage(outcome));

      if (outcome.kind !== 'server' && outcome.kind !== 'insufficient-inventory') {
        onStale();
      }
    }
  }

  const title = kind === 'depart' ? '출발 처리' : '여행 완료 처리';
  const confirmLabel = kind === 'depart' ? '출발 처리' : '완료 처리';

  return (
    <Dialog
      closeLabel="닫기"
      closeOnEscape={!submitting}
      closeOnInteractOutside={!submitting}
      description={
        kind === 'depart'
          ? '출발 처리하면 Theme별 기념품이 재고에서 차감됩니다. 되돌릴 수 없습니다.'
          : '여행을 완료 처리합니다. 되돌릴 수 없습니다.'
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={operation !== null}
      title={title}
    >
      <div className={styles.body}>
        <dl className={styles.summary}>
          <div>
            <dt>상품</dt>
            <dd>{schedule.tourName}</dd>
          </div>
          <div>
            <dt>일정</dt>
            <dd>{formatScheduleDates(schedule)}</dd>
          </div>
          <div>
            <dt>인원</dt>
            <dd>{schedule.participantCount}명</dd>
          </div>
          {kind === 'depart' ? (
            <div>
              <dt>예상 차감</dt>
              <dd>
                {deduction.quantity === 0
                  ? '차감할 물품 없음'
                  : `${inventoryItemLabel(deduction.itemType)} ${formatQuantity(deduction.quantity)}`}
              </dd>
            </div>
          ) : null}
        </dl>

        {alert === null ? null : (
          <p className={styles.alert} role="alert">
            {alert}
          </p>
        )}

        <div className={styles.actions}>
          <Button onClick={onClose} variant="secondary">
            취소
          </Button>
          <Button isLoading={submitting} loadingLabel="처리 중" onClick={() => void confirm()}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
