import type { InventoryItemType } from '@/features/employee-inventory/inventory.model';
import type { TourTheme } from '@/features/tour-discovery';

export type ScheduleOperationStatus = 'SCHEDULED' | 'DEPARTED' | 'COMPLETED';

/** 직원이 보는 여행 일정 한 건 (Backend 값 그대로). */
export interface EmployeeSchedule {
  id: number;
  tourId: number;
  tourName: string;
  theme: TourTheme;
  startDate: string;
  endDate: string;
  participantCount: number;
  confirmed: boolean;
  operationStatus: ScheduleOperationStatus;
}

/** 출발 처리로 차감된 기념품. `remainingQuantity`는 서버가 계산한 차감 후 총 재고다. */
export interface DeductedItem {
  itemType: InventoryItemType;
  quantity: number;
  remainingQuantity: number;
}

export interface ScheduleDepartureResult {
  schedule: EmployeeSchedule;
  deductedItems: readonly DeductedItem[];
}
