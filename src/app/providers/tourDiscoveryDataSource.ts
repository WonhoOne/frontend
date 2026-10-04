import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendTourDiscoveryDataSource,
  MockTourDiscoveryDataSource,
  tourDiscoveryPreviewProducts,
  type TourDiscoveryDataSource,
} from '@/features/tour-discovery';

function createTourDiscoveryDataSource(): TourDiscoveryDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockTourDiscoveryDataSource(tourDiscoveryPreviewProducts);
  }

  return new BackendTourDiscoveryDataSource(backendHttpClient);
}

export const tourDiscoveryDataSource = createTourDiscoveryDataSource();
