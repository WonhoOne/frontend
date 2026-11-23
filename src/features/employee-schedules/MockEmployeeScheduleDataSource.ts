import type { InventoryItemType } from '@/features/employee-inventory/inventory.model';
import { mockHttpError } from '@/features/employee-tours/MockEmployeeTourDataSource';
import type { EmployeeScheduleDataSource } from '@/features/employee-schedules/EmployeeScheduleDataSource';
import type {
  EmployeeSchedule,
  ScheduleDepartureResult,
} from '@/features/employee-schedules/employeeSchedule.model';
import { expectedDeduction } from '@/features/employee-schedules/scheduleRules';

/**
 * DEV(`VITE_ENABLE_MOCKS=true`)와 테스트용 in-memory 구현. Backend 규칙(contract §2)을 흉내 낸다.
 * Synthetic data only. Production build에는 composition root가 포함하지 않는다.
 */
export class MockEmployeeScheduleDataSource implements EmployeeScheduleDataSource {
  private schedules: EmployeeSchedule[];
  private stock: Map<InventoryItemType, number>;

  constructor(
    seed: readonly EmployeeSchedule[],
    stock: Partial<Record<InventoryItemType, number>> = {},
  ) {
    this.schedules = seed.map((schedule) => ({ ...schedule }));
    this.stock = new Map(
      (['COUPLE_TSHIRT', 'GINSENG_GIFT', 'GOLF_BALL', 'SCARF'] as const).map((itemType) => [
        itemType,
        stock[itemType] ?? 20,
      ]),
    );
  }

  listSchedules() {
    return Promise.resolve(this.schedules.map((schedule) => ({ ...schedule })));
  }

  markDeparted(scheduleId: number): Promise<ScheduleDepartureResult> {
    const current = this.schedules.find((schedule) => schedule.id === scheduleId);

    if (current === undefined) {
      return Promise.reject(mockHttpError(404, 'TOUR_SCHEDULE_NOT_FOUND'));
    }

    if (current.operationStatus !== 'SCHEDULED') {
      return Promise.reject(mockHttpError(409, 'SCHEDULE_ALREADY_DEPARTED'));
    }

    if (!current.confirmed) {
      return Promise.reject(mockHttpError(409, 'SCHEDULE_NOT_CONFIRMED'));
    }

    const { itemType, quantity } = expectedDeduction(current);
    const available = this.stock.get(itemType) ?? 0;

    if (available < quantity) {
      return Promise.reject(mockHttpError(409, 'INSUFFICIENT_INVENTORY'));
    }

    const updated: EmployeeSchedule = { ...current, operationStatus: 'DEPARTED' };
    this.replace(updated);

    if (quantity === 0) {
      return Promise.resolve({ schedule: { ...updated }, deductedItems: [] });
    }

    this.stock.set(itemType, available - quantity);
    return Promise.resolve({
      schedule: { ...updated },
      deductedItems: [{ itemType, quantity, remainingQuantity: available - quantity }],
    });
  }

  markCompleted(scheduleId: number): Promise<EmployeeSchedule> {
    const current = this.schedules.find((schedule) => schedule.id === scheduleId);

    if (current === undefined) {
      return Promise.reject(mockHttpError(404, 'TOUR_SCHEDULE_NOT_FOUND'));
    }

    if (current.operationStatus !== 'DEPARTED') {
      return Promise.reject(mockHttpError(409, 'SCHEDULE_NOT_DEPARTED'));
    }

    const updated: EmployeeSchedule = { ...current, operationStatus: 'COMPLETED' };
    this.replace(updated);
    return Promise.resolve({ ...updated });
  }

  private replace(updated: EmployeeSchedule) {
    this.schedules = this.schedules.map((schedule) =>
      schedule.id === updated.id ? updated : schedule,
    );
  }
}
