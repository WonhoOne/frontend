import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendReservationDataSource,
  mockReservationDataSource,
  type ReservationDataSource,
} from '@/features/reservation';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';

export interface ReservationCompositionEnvironment {
  DEV: boolean;
  VITE_ENABLE_MOCKS?: string;
}

export interface ReservationDataSourceCompositionOptions {
  client?: Pick<BackendHttpClient, 'requestJson'>;
  environment?: ReservationCompositionEnvironment;
}

/**
 * Reservation composition policy.
 *
 * Production/normal development always use the real Backend. The legacy
 * in-memory Reservation source is available only in explicit DEV mock mode.
 * There is no network-failure fallback from real to mock.
 */
export function createReservationDataSource(
  options: ReservationDataSourceCompositionOptions = {},
): ReservationDataSource {
  const environment = options.environment ?? import.meta.env;
  const client = options.client ?? backendHttpClient;

  if (environment.DEV && environment.VITE_ENABLE_MOCKS === 'true') {
    return mockReservationDataSource;
  }

  return new BackendReservationDataSource(client);
}

export const reservationDataSource = import.meta.env.PROD
  ? new BackendReservationDataSource(backendHttpClient)
  : createReservationDataSource();
