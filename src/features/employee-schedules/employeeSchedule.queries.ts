import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { employeeInventoryQueryKey } from '@/features/employee-inventory/inventory.queries';
import type { EmployeeScheduleDataSource } from '@/features/employee-schedules/EmployeeScheduleDataSource';
import type { EmployeeSchedule } from '@/features/employee-schedules/employeeSchedule.model';
import { shouldRetryScheduleRead } from '@/features/employee-schedules/employeeScheduleErrors';

/** SECURITY: `'employee'`로 시작하는 private key. 로그아웃·401 때 비워진다. */
export const employeeSchedulesQueryKey = ['employee', 'tour-schedules'] as const;

export function useEmployeeSchedules(dataSource: EmployeeScheduleDataSource) {
  return useQuery({
    queryKey: employeeSchedulesQueryKey,
    queryFn: ({ signal }) => dataSource.listSchedules(signal),
    staleTime: 0,
    meta: { privacy: 'private' },
    retry: shouldRetryScheduleRead,
  });
}

function replaceSchedule(
  current: readonly EmployeeSchedule[] | undefined,
  updated: EmployeeSchedule,
) {
  return current?.map((schedule) => (schedule.id === updated.id ? updated : schedule));
}

/**
 * 출발 처리. 비관적이고 자동 재시도하지 않는다.
 * 성공하면 일정과 재고 목록을 모두 다시 읽는다 (재고 화면이 차감된 값을 보여야 한다).
 */
export function useMarkDeparted(dataSource: EmployeeScheduleDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) => dataSource.markDeparted(scheduleId),
    retry: 0,
    onSuccess: (result) => {
      queryClient.setQueryData<readonly EmployeeSchedule[]>(employeeSchedulesQueryKey, (current) =>
        replaceSchedule(current, result.schedule),
      );
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeSchedulesQueryKey }),
        queryClient.invalidateQueries({ queryKey: employeeInventoryQueryKey }),
      ]);
    },
  });
}

export function useMarkCompleted(dataSource: EmployeeScheduleDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) => dataSource.markCompleted(scheduleId),
    retry: 0,
    onSuccess: (schedule) => {
      queryClient.setQueryData<readonly EmployeeSchedule[]>(employeeSchedulesQueryKey, (current) =>
        replaceSchedule(current, schedule),
      );
      return queryClient.invalidateQueries({ queryKey: employeeSchedulesQueryKey });
    },
  });
}
