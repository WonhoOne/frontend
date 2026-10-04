import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import {
  shouldRetryTourSchedule,
  toTourScheduleSectionState,
  tourScheduleQueryOptions,
  type TourScheduleDataSource,
} from '@/features/tour-detail';
import { BackendNetworkError } from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';

describe('Tour Schedule query boundary', () => {
  it('forwards a separate TanStack Query AbortSignal to the schedule DataSource', async () => {
    let receivedSignal: AbortSignal | undefined;
    const getTourSchedules: TourScheduleDataSource['getTourSchedules'] = (_, options) => {
      receivedSignal = options?.signal;
      return Promise.resolve([]);
    };
    const source: TourScheduleDataSource = {
      getTourSchedules: vi.fn(getTourSchedules),
    };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    await client.fetchQuery(tourScheduleQueryOptions(source, 103));

    expect(receivedSignal).toBeInstanceOf(AbortSignal);
  });

  it('maps an empty filtered schedule result to an independent empty section', () => {
    expect(
      toTourScheduleSectionState({
        data: [],
        error: null,
        isError: false,
        isFetching: false,
        isPending: false,
      }),
    ).toEqual({ status: 'empty' });
  });

  it('keeps successful schedule data visible when a refresh later fails', () => {
    const choices = [
      {
        selectionKey: 1301,
        dateLabel: '2027-03-10 – 2027-03-14',
        statusLabel: 'Reservation available',
        recruitmentSummary: '2 / 3 participants · Not confirmed',
        isSelectable: true,
      },
    ];

    expect(
      toTourScheduleSectionState({
        data: choices,
        error: new BackendNetworkError(),
        isError: true,
        isFetching: false,
        isPending: false,
      }),
    ).toMatchObject({ status: 'ready', freshness: 'stale', choices });
  });

  it('retries network failures once but never retries identity/contract failures', () => {
    expect(shouldRetryTourSchedule(0, new BackendNetworkError())).toBe(true);
    expect(shouldRetryTourSchedule(1, new BackendNetworkError())).toBe(false);
    expect(
      shouldRetryTourSchedule(
        0,
        new ContractMappingError('TourSchedule', '$.tourId', 'resource-identity-mismatch'),
      ),
    ).toBe(false);
  });
});
