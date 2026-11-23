import { describe, expect, it, vi } from 'vitest';

import {
  BackendEmployeeScheduleDataSource,
  canMarkCompleted,
  canMarkDeparted,
  expectedDeduction,
  formatDeductedItem,
  scheduleOperationMessage,
  toScheduleOperationOutcome,
  type EmployeeSchedule,
} from '@/features/employee-schedules';
import { mockHttpError } from '@/features/employee-tours/MockEmployeeTourDataSource';
import { BackendNetworkError } from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';

const schedule: EmployeeSchedule = {
  id: 5,
  tourId: 2,
  tourName: 'Synthetic Trekking',
  theme: 'OUTDOOR_TREKKING',
  startDate: '2026-12-19',
  endDate: '2026-12-21',
  participantCount: 3,
  confirmed: true,
  operationStatus: 'SCHEDULED',
};

function ok(body: unknown) {
  return { status: 200, statusText: 'OK', headers: {}, body };
}

describe('BackendEmployeeScheduleDataSource', () => {
  it('lists schedules with the employee bearer', async () => {
    const requestJson = vi.fn().mockResolvedValue(ok([schedule]));
    const source = new BackendEmployeeScheduleDataSource({ requestJson });

    await expect(source.listSchedules()).resolves.toEqual([schedule]);
    expect(requestJson).toHaveBeenCalledWith({
      path: '/employee/tour-schedules',
      authentication: 'required',
    });
  });

  it('posts a departure without a body and returns the server deduction', async () => {
    const requestJson = vi.fn().mockResolvedValue(
      ok({
        schedule: { ...schedule, operationStatus: 'DEPARTED' },
        deductedItems: [{ itemType: 'SCARF', quantity: 3, remainingQuantity: 17 }],
      }),
    );
    const source = new BackendEmployeeScheduleDataSource({ requestJson });

    await expect(source.markDeparted(5)).resolves.toEqual({
      schedule: { ...schedule, operationStatus: 'DEPARTED' },
      deductedItems: [{ itemType: 'SCARF', quantity: 3, remainingQuantity: 17 }],
    });
    expect(requestJson).toHaveBeenCalledWith({
      path: '/employee/tour-schedules/5/departure',
      method: 'POST',
      authentication: 'required',
    });
  });

  it('posts a completion and refuses a response for another schedule', async () => {
    const requestJson = vi
      .fn()
      .mockResolvedValueOnce(ok({ schedule: { ...schedule, operationStatus: 'COMPLETED' } }))
      .mockResolvedValueOnce(ok({ schedule: { ...schedule, id: 6 } }));
    const source = new BackendEmployeeScheduleDataSource({ requestJson });

    await expect(source.markCompleted(5)).resolves.toMatchObject({ operationStatus: 'COMPLETED' });
    expect(requestJson).toHaveBeenCalledWith({
      path: '/employee/tour-schedules/5/completion',
      method: 'POST',
      authentication: 'required',
    });
    await expect(source.markCompleted(5)).rejects.toBeInstanceOf(ContractMappingError);
  });
});

describe('schedule rules', () => {
  it('enables departure only for confirmed scheduled trips and completion only after departure', () => {
    expect(canMarkDeparted(schedule)).toBe(true);
    expect(canMarkDeparted({ ...schedule, confirmed: false })).toBe(false);
    expect(canMarkDeparted({ ...schedule, operationStatus: 'DEPARTED' })).toBe(false);
    expect(canMarkCompleted(schedule)).toBe(false);
    expect(canMarkCompleted({ ...schedule, operationStatus: 'DEPARTED' })).toBe(true);
    expect(canMarkCompleted({ ...schedule, operationStatus: 'COMPLETED' })).toBe(false);
  });

  it('previews one souvenir per participant, one t-shirt per honeymoon couple', () => {
    expect(expectedDeduction(schedule)).toEqual({ itemType: 'SCARF', quantity: 3 });
    expect(
      expectedDeduction({ ...schedule, theme: 'HONEYMOON_ROMANCE', participantCount: 4 }),
    ).toEqual({ itemType: 'COUPLE_TSHIRT', quantity: 2 });
    expect(expectedDeduction({ ...schedule, theme: 'PARENTS_HEALING' })).toEqual({
      itemType: 'GINSENG_GIFT',
      quantity: 3,
    });
    expect(expectedDeduction({ ...schedule, theme: 'GOLF_CHALLENGE' })).toEqual({
      itemType: 'GOLF_BALL',
      quantity: 3,
    });
  });

  it('formats a deduction with the remaining stock', () => {
    expect(formatDeductedItem({ itemType: 'SCARF', quantity: 3, remainingQuantity: 17 })).toBe(
      '아웃도어 기념품 스카프 −3개, 남은 재고 17개',
    );
  });
});

describe('schedule operation errors', () => {
  it.each([
    ['SCHEDULE_NOT_CONFIRMED', 'not-confirmed'],
    ['SCHEDULE_ALREADY_DEPARTED', 'already-departed'],
    ['SCHEDULE_NOT_DEPARTED', 'not-departed'],
  ])('maps 409 %s', (code, kind) => {
    expect(toScheduleOperationOutcome(mockHttpError(409, code))).toEqual({ kind });
  });

  it('keeps the readable INSUFFICIENT_INVENTORY explanation', () => {
    const outcome = toScheduleOperationOutcome(mockHttpError(409, 'INSUFFICIENT_INVENTORY'));

    expect(outcome).toEqual({ kind: 'insufficient-inventory', detail: 'Synthetic mock error' });
    expect(scheduleOperationMessage(outcome)).toBe(
      '재고가 부족해 출발 처리하지 못했습니다. 재고는 바뀌지 않았습니다. Synthetic mock error',
    );
  });

  it('maps not-found, forbidden, server and unknown outcomes', () => {
    expect(toScheduleOperationOutcome(mockHttpError(404, 'TOUR_SCHEDULE_NOT_FOUND'))).toEqual({
      kind: 'not-found',
    });
    expect(toScheduleOperationOutcome(mockHttpError(403, 'FORBIDDEN'))).toEqual({
      kind: 'forbidden',
    });
    expect(toScheduleOperationOutcome(mockHttpError(500, 'INTERNAL_ERROR'))).toEqual({
      kind: 'server',
    });
    expect(toScheduleOperationOutcome(new BackendNetworkError())).toEqual({ kind: 'unknown' });
  });
});
