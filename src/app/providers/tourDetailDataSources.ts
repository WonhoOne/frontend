import { backendHttpClient } from '@/app/providers/backendHttpClient';
import {
  BackendTourDetailDataSource,
  BackendTourScheduleDataSource,
  MockTourDetailDataSource,
  MockTourScheduleDataSource,
  type TourDetailDataSource,
  type TourScheduleDataSource,
} from '@/features/tour-detail';

function createTourDetailDataSource(): TourDetailDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockTourDetailDataSource();
  }

  return new BackendTourDetailDataSource(backendHttpClient);
}

function createTourScheduleDataSource(): TourScheduleDataSource {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    return new MockTourScheduleDataSource();
  }

  return new BackendTourScheduleDataSource(backendHttpClient);
}

export const tourDetailDataSource = createTourDetailDataSource();
export const tourScheduleDataSource = createTourScheduleDataSource();
