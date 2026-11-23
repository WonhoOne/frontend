import type { EmployeeSchedule } from '@/features/employee-schedules/employeeSchedule.model';
import styles from '@/features/employee-schedules/ScheduleTable.module.css';
import {
  canMarkCompleted,
  canMarkDeparted,
  formatScheduleDates,
  operationStatusLabel,
} from '@/features/employee-schedules/scheduleRules';
import { ThemeLabel } from '@/features/employee-tours/ThemeLabel';
import { Button } from '@/shared/ui';

interface ScheduleTableProps {
  schedules: readonly EmployeeSchedule[];
  onDepart: (schedule: EmployeeSchedule) => void;
  onComplete: (schedule: EmployeeSchedule) => void;
  highlightedId?: number | null;
}

/**
 * 여행 일정 운영 상태 표 (v0.3 demo).
 * CONTRACT: 버튼 활성 조건은 안내일 뿐이며 최종 판단은 Backend 409다.
 */
export function ScheduleTable({
  highlightedId = null,
  onComplete,
  onDepart,
  schedules,
}: ScheduleTableProps) {
  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <caption className={styles.caption}>여행 일정별 운영 상태</caption>
        <thead>
          <tr>
            <th scope="col">상품</th>
            <th scope="col">Theme</th>
            <th scope="col">일정</th>
            <th className={styles.numeric} scope="col">
              인원
            </th>
            <th scope="col">모집</th>
            <th scope="col">운영 상태</th>
            <th scope="col">
              <span className={styles.caption}>작업</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => (
            <tr
              className={schedule.id === highlightedId ? styles.highlighted : undefined}
              data-schedule-id={schedule.id}
              key={schedule.id}
            >
              <th scope="row">{schedule.tourName}</th>
              <td>
                <ThemeLabel theme={schedule.theme} />
              </td>
              <td className={styles.nowrap}>{formatScheduleDates(schedule)}</td>
              <td className={styles.numeric}>{schedule.participantCount}명</td>
              <td>{schedule.confirmed ? '확정' : '모집 중'}</td>
              <td>
                <span className={styles.status} data-status={schedule.operationStatus}>
                  {operationStatusLabel(schedule.operationStatus)}
                </span>
              </td>
              <td className={styles.action}>
                <Button
                  aria-label={`${schedule.tourName} ${schedule.startDate} 출발 처리`}
                  disabled={!canMarkDeparted(schedule)}
                  onClick={() => onDepart(schedule)}
                  size="small"
                  variant="secondary"
                >
                  출발 처리
                </Button>
                <Button
                  aria-label={`${schedule.tourName} ${schedule.startDate} 완료 처리`}
                  disabled={!canMarkCompleted(schedule)}
                  onClick={() => onComplete(schedule)}
                  size="small"
                  variant="secondary"
                >
                  완료 처리
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
