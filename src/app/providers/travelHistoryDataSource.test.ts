import { describe, expect, it, vi } from 'vitest';

import { createTravelHistoryDataSource } from '@/app/providers/travelHistoryDataSource';
import {
  BackendTravelHistoryDataSource,
  MockTravelHistoryDataSource,
} from '@/features/travel-history';

describe('Travel History composition', () => {
  it('selects the Real Backend in production even if the mock flag is set', () => {
    const source = createTravelHistoryDataSource({
      environment: { DEV: false, VITE_ENABLE_MOCKS: 'true' },
      client: { requestJson: vi.fn() },
    });
    expect(source).toBeInstanceOf(BackendTravelHistoryDataSource);
  });

  it('selects the Real Backend in normal development', () => {
    const source = createTravelHistoryDataSource({
      environment: { DEV: true, VITE_ENABLE_MOCKS: 'false' },
      client: { requestJson: vi.fn() },
    });
    expect(source).toBeInstanceOf(BackendTravelHistoryDataSource);
  });

  it('allows an empty mock only with explicit DEV opt-in', async () => {
    const requestJson = vi.fn();
    const source = createTravelHistoryDataSource({
      environment: { DEV: true, VITE_ENABLE_MOCKS: 'true' },
      client: { requestJson },
    });
    expect(source).toBeInstanceOf(MockTravelHistoryDataSource);
    await expect(source.getTravelHistory()).resolves.toEqual([]);
    expect(requestJson).not.toHaveBeenCalled();
  });

  it('does not silently fall back to Mock when Real fails', async () => {
    const requestJson = vi.fn().mockRejectedValue(new Error('synthetic unavailable'));
    const source = createTravelHistoryDataSource({
      environment: { DEV: false },
      client: { requestJson },
    });
    await expect(source.getTravelHistory()).rejects.toThrow('synthetic unavailable');
    expect(requestJson).toHaveBeenCalledTimes(1);
  });
});
