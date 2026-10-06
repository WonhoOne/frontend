import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendTourDiscoveryDataSource,
  MockTourDiscoveryDataSource,
  type TourDiscoveryDataSource,
} from '@/features/tour-discovery';

function createTourDiscoveryDataSource(): TourDiscoveryDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockTourDiscoveryDataSource();
  }

  return new BackendTourDiscoveryDataSource(backendHttpClient);
}

export const tourDiscoveryDataSource = createTourDiscoveryDataSource();
