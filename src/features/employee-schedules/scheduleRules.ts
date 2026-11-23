import type { InventoryItemType } from '@/features/employee-inventory/inventory.model';
import { formatQuantity, inventoryItemLabel } from '@/features/employee-inventory/stockAddRules';
import type {
  DeductedItem,
  EmployeeSchedule,
  ScheduleOperationStatus,
} from '@/features/employee-schedules/employeeSchedule.model';
import type { TourTheme } from '@/features/tour-discovery';

const STATUS_LABELS: Readonly<Record<ScheduleOperationStatus, string>> = {
  SCHEDULED: '출발 전',
  DEPARTED: '여행 중',
  COMPLETED: '완료',
};

export function operationStatusLabel(status: ScheduleOperationStatus): string {
  return STATUS_LABELS[status];
}

/** 모집이 확정된 출발 전 일정만 출발 처리할 수 있다. 최종 판단은 Backend 409다. */
export function canMarkDeparted(schedule: EmployeeSchedule): boolean {
  return schedule.confirmed && schedule.operationStatus === 'SCHEDULED';
}

export function canMarkCompleted(schedule: EmployeeSchedule): boolean {
  return schedule.operationStatus === 'DEPARTED';
}

/** Theme별 출발 기념품 (contract §2). 한 Theme에 한 품목이다. */
const SOUVENIR_BY_THEME: Readonly<Record<TourTheme, InventoryItemType>> = {
  HONEYMOON_ROMANCE: 'COUPLE_TSHIRT',
  PARENTS_HEALING: 'GINSENG_GIFT',
  GOLF_CHALLENGE: 'GOLF_BALL',
  OUTDOOR_TREKKING: 'SCARF',
};

/**
 * 확인 단계에 보여줄 예상 차감량. 미리보기일 뿐이며 실제 차감은 서버 응답을 쓴다.
 * 허니문은 커플당 1장이다.
 */
export function expectedDeduction(schedule: EmployeeSchedule): {
  itemType: InventoryItemType;
  quantity: number;
} {
  const itemType = SOUVENIR_BY_THEME[schedule.theme];
  const quantity =
    schedule.theme === 'HONEYMOON_ROMANCE'
      ? Math.floor(schedule.participantCount / 2)
      : schedule.participantCount;

  return { itemType, quantity };
}

/** 예: "아웃도어 기념품 스카프 −3개, 남은 재고 17개" */
export function formatDeductedItem(item: DeductedItem): string {
  return `${inventoryItemLabel(item.itemType)} −${formatQuantity(item.quantity)}, 남은 재고 ${formatQuantity(item.remainingQuantity)}`;
}

export function formatScheduleDates(schedule: EmployeeSchedule): string {
  return `${schedule.startDate} – ${schedule.endDate}`;
}
