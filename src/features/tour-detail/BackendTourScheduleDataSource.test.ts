import { describe, expect, it, vi } from 'vitest';

import { BackendTourScheduleDataSource } from '@/features/tour-detail';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { ContractMappingError } from '@/integrations/backend/contracts';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('BackendTourScheduleDataSource', () => {
  it('proves HTTP → decode → identity validation → schedule model and forwards AbortSignal', async () => {
    const fetchImplementation = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: 1301,
          tourId: 103,
          startDate: '2027-03-10',
          endDate: '2027-03-14',
          reservable: true,
          recruitment: {
            unit: 'PARTICIPANT',
            currentCount: 2,
            requiredCount: 3,
            confirmed: false,
          },
        },
      ]),
    );
    const source = new BackendTourScheduleDataSource(
      new BackendHttpClient({
        baseUrl: 'https://example.test/api/v1',
        fetchImplementation,
      }),
    );
    const controller = new AbortController();

    const schedules = await source.getTourSchedules(103, { signal: controller.signal });

    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://example.test/api/v1/tour-schedules?tourId=103',
      expect.objectContaining({ method: 'GET', signal: controller.signal }),
    );
    expect(schedules).toEqual([
      {
        selectionKey: '1301',
        dateLabel: '2027-03-10 – 2027-03-14',
        statusLabel: 'Reservation available',
        recruitmentSummary: '2 / 3 participants · Not confirmed',
        isSelectable: true,
      },
    ]);
  });

  it('rejects cross-tour schedule identity drift', async () => {
    const source = new BackendTourScheduleDataSource(
      new BackendHttpClient({
        baseUrl: '/api/v1',
        fetchImplementation: vi.fn().mockResolvedValue(
          jsonResponse([
            {
              id: 1301,
              tourId: 104,
              startDate: '2027-03-10',
              endDate: '2027-03-14',
              reservable: true,
              recruitment: {
                unit: 'PARTICIPANT',
                currentCount: 2,
                requiredCount: 3,
                confirmed: false,
              },
            },
          ]),
        ),
      }),
    );

    await expect(source.getTourSchedules(103)).rejects.toBeInstanceOf(ContractMappingError);
  });
});
