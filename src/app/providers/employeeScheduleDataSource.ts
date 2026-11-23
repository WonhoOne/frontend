import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendEmployeeScheduleDataSource,
  MockEmployeeScheduleDataSource,
  type EmployeeScheduleDataSource,
} from '@/features/employee-schedules';

/**
 * Employee departure-operations DataSource composition (v0.3 demo).
 * SECURITY: Mock은 DEV + 명시적 `VITE_ENABLE_MOCKS=true`에서만. 실패 시 Mock fallback 없음.
 */
function createEmployeeScheduleDataSource(): EmployeeScheduleDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockEmployeeScheduleDataSource(
      [
        {
          id: 5,
          tourId: 2,
          tourName: 'Synthetic Trekking Journey',
          theme: 'OUTDOOR_TREKKING',
          startDate: '2026-12-19',
          endDate: '2026-12-21',
          participantCount: 3,
          confirmed: true,
          operationStatus: 'SCHEDULED',
        },
        {
          id: 6,
          tourId: 1,
          tourName: 'Synthetic Golf Journey',
          theme: 'GOLF_CHALLENGE',
          startDate: '2026-12-26',
          endDate: '2026-12-28',
          participantCount: 1,
          confirmed: false,
          operationStatus: 'SCHEDULED',
        },
      ],
      { SCARF: 8, GOLF_BALL: 35 },
    );
  }

  return new BackendEmployeeScheduleDataSource(backendHttpClient);
}

export const employeeScheduleDataSource = createEmployeeScheduleDataSource();
