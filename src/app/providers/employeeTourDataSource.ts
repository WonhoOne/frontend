import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendEmployeeTourDataSource,
  MockEmployeeTourDataSource,
  type EmployeeTourDataSource,
} from '@/features/employee-tours';

/**
 * Employee TourProduct DataSource composition (CP7 A-6).
 *
 * SECURITY: Mock은 DEV + 명시적 `VITE_ENABLE_MOCKS=true`에서만 쓴다. 실패 시 Mock으로
 * 조용히 바꾸지 않는다. Production build는 항상 Backend를 쓴다.
 */
function createEmployeeTourDataSource(): EmployeeTourDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockEmployeeTourDataSource(
      [
        {
          id: '1',
          theme: 'GOLF_CHALLENGE',
          name: 'Synthetic Golf Journey',
          description: 'Development-only synthetic product.',
          stylePrices: [
            { style: 'CLASSIC', amount: 1200000 },
            { style: 'GRAND', amount: 1800000 },
            { style: 'PREMIUM', amount: 2500000 },
          ],
        },
      ],
      new Set(['1']),
    );
  }

  return new BackendEmployeeTourDataSource(backendHttpClient);
}

export const employeeTourDataSource = createEmployeeTourDataSource();
