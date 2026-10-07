import { describe, expect, it, vi } from 'vitest';

import { refreshReservationConflictTruth } from '@/features/reservation/reservationConflictTruth';

describe('Reservation conflict truth refresh', () => {
  it('refetches both approved public truth resources for a canonical product identity', async () => {
    const refetchQueries = vi.fn().mockResolvedValue(undefined);

    await expect(
      refreshReservationConflictTruth({ refetchQueries }, '42'),
    ).resolves.toBe(true);

    expect(refetchQueries).toHaveBeenCalledTimes(2);
    expect(refetchQueries).toHaveBeenNthCalledWith(1, {
      queryKey: ['public', 'tour-product', 42],
      type: 'all',
    });
    expect(refetchQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ['public', 'tour-schedules', 42],
      type: 'all',
    });
  });

  it('does not invent a Backend identity for opaque or malformed Draft identities', async () => {
    const refetchQueries = vi.fn().mockResolvedValue(undefined);

    await expect(
      refreshReservationConflictTruth({ refetchQueries }, 'fixture:tour:42'),
    ).resolves.toBe(false);

    expect(refetchQueries).not.toHaveBeenCalled();
  });
});
