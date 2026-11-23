import { useState } from 'react';

import { employeeScheduleDataSource } from '@/app/providers/employeeScheduleDataSource';
import { EmployeePageHeader } from '@/app/shell/EmployeePageHeader';
import { EmptyState, LoadingState, RefreshIndicator, SectionError } from '@/app/state';
import {
  formatDeductedItem,
  isScheduleReadForbidden,
  isScheduleShapeProblem,
  ScheduleOperationDialog,
  ScheduleTable,
  useEmployeeSchedules,
  type ScheduleOperation,
} from '@/features/employee-schedules';
import styles from '@/pages/employee-schedules/EmployeeSchedulesPage.module.css';
import { EmployeeAccessDenied } from '@/pages/employee-status/EmployeeAccessDenied';
import { PageContainer, Skeleton } from '@/shared/ui';

/**
 * 출발 관리 (v0.3 demo, scenario 3: 여행 출발 → 물품 차감, 여행 완료).
 *
 * CONTRACT: 출발/완료는 확인 단계를 거친 뒤에만 보낸다. 성공 후 보이는 차감량과
 * 남은 재고는 서버 응답 값이다. 재고 화면 cache도 함께 다시 읽게 한다.
 */
export function EmployeeSchedulesPage() {
  const schedules = useEmployeeSchedules(employeeScheduleDataSource);
  const [operation, setOperation] = useState<ScheduleOperation | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [forbidden, setForbidden] = useState(false);

  if (forbidden || (schedules.error !== null && isScheduleReadForbidden(schedules.error))) {
    return <EmployeeAccessDenied variant="forbidden" />;
  }

  const items = schedules.data;

  return (
    <PageContainer>
      <EmployeePageHeader
        meta="모집이 확정된 일정을 출발 처리하면 Theme별 기념품이 재고에서 차감됩니다. 여행이 끝나면 완료 처리합니다."
        title="출발 관리"
        {...(items === undefined ? {} : { count: items.length })}
      />

      <div aria-live="polite" className={styles.statusRegion} role="status">
        {status === null ? null : <p className={styles.status}>{status}</p>}
      </div>

      {items === undefined ? (
        schedules.isError ? (
          <SectionError
            isRetrying={schedules.isFetching}
            onRetry={() => void schedules.refetch()}
            retryLabel="다시 시도"
            retryingLabel="다시 불러오는 중"
            title={
              isScheduleShapeProblem(schedules.error)
                ? '데이터 형식이 올바르지 않습니다'
                : '일정을 불러오지 못했습니다'
            }
          >
            <p>잠시 후 다시 시도해 주세요.</p>
          </SectionError>
        ) : (
          <LoadingState label="일정을 불러오고 있습니다">
            <div className={styles.skeleton}>
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} style={{ blockSize: 56 }} />
              ))}
            </div>
          </LoadingState>
        )
      ) : items.length === 0 ? (
        <EmptyState title="등록된 여행 일정이 없습니다">
          <p>여행 일정이 생기면 여기에서 출발과 완료를 처리할 수 있습니다.</p>
        </EmptyState>
      ) : (
        <>
          {schedules.isRefetchError ? (
            <p className={styles.refreshError}>
              최신 정보를 불러오지 못했습니다.{' '}
              <button
                className={styles.inlineRetry}
                onClick={() => void schedules.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </p>
          ) : schedules.isFetching ? (
            <RefreshIndicator label="최신 일정을 확인하고 있습니다" state="refreshing" />
          ) : null}

          <ScheduleTable
            highlightedId={highlighted}
            onComplete={(schedule) => {
              setStatus(null);
              setOperation({ kind: 'complete', schedule });
            }}
            onDepart={(schedule) => {
              setStatus(null);
              setOperation({ kind: 'depart', schedule });
            }}
            schedules={items}
          />
        </>
      )}

      <ScheduleOperationDialog
        dataSource={employeeScheduleDataSource}
        onClose={() => setOperation(null)}
        onCompleted={(schedule) => {
          setOperation(null);
          setHighlighted(schedule.id);
          setStatus(`${schedule.tourName} (${schedule.startDate}) 여행을 완료 처리했습니다.`);
        }}
        onDeparted={({ deductedItems, schedule }) => {
          setOperation(null);
          setHighlighted(schedule.id);
          setStatus(
            `${schedule.tourName} (${schedule.startDate}) 출발 처리했습니다. ${
              deductedItems.length === 0
                ? '차감된 물품이 없습니다.'
                : `차감: ${deductedItems.map(formatDeductedItem).join(' · ')}`
            }`,
          );
        }}
        onForbidden={() => setForbidden(true)}
        onStale={() => void schedules.refetch()}
        operation={operation}
      />
    </PageContainer>
  );
}
