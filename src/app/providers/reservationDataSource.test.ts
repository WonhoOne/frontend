import { describe, expect, it, vi } from 'vitest';

import { createReservationDataSource } from '@/app/providers/reservationDataSource';
import {
  BackendReservationDataSource,
  mockReservationDataSource,
  type CreateReservationInput,
} from '@/features/reservation';

const input: CreateReservationInput = {
  scheduleId: 501,
  participantCount: 2,
  configuration: {
    style: 'GRAND',
    hotelOption: 'HOTEL_4_STAR',
    transportOption: 'PRIVATE_LUXURY_CAR_2',
    mealOption: 'LOCAL_RESTAURANT',
    extraOptions: [],
  },
};

describe('Reservation data source composition', () => {
  it('uses BackendReservationDataSource in production even when the mock flag is configured', () => {
    const source = createReservationDataSource({
      environment: {
        DEV: false,
        VITE_ENABLE_MOCKS: 'true',
      },
      client: { requestJson: vi.fn() },
    });

    expect(source).toBeInstanceOf(BackendReservationDataSource);
  });

  it('uses BackendReservationDataSource in ordinary development', () => {
    const source = createReservationDataSource({
      environment: {
        DEV: true,
        VITE_ENABLE_MOCKS: 'false',
      },
      client: { requestJson: vi.fn() },
    });

    expect(source).toBeInstanceOf(BackendReservationDataSource);
  });

  it('permits the Reservation mock only in explicit DEV mock mode', async () => {
    const requestJson = vi.fn();
    const source = createReservationDataSource({
      environment: {
        DEV: true,
        VITE_ENABLE_MOCKS: 'true',
      },
      client: { requestJson },
    });

    expect(source).toBe(mockReservationDataSource);
    await expect(source.createReservation(input)).resolves.toMatchObject({ id: 801 });
    expect(requestJson).not.toHaveBeenCalled();
  });

  it('does not silently fall back to mock after a real Backend failure', async () => {
    const requestJson = vi.fn().mockRejectedValue(new Error('synthetic transport failure'));
    const source = createReservationDataSource({
      environment: { DEV: false },
      client: { requestJson },
    });

    await expect(source.createReservation(input)).rejects.toMatchObject({
      detail: { kind: 'unknown' },
    });
    expect(requestJson).toHaveBeenCalledTimes(1);
  });
});
