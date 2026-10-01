import { describe, expect, it, vi } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import { createReservationMutationController } from '@/features/reservation/reservationMutation';
import type {
  CreateReservationInput,
  ReservationModel,
} from '@/features/reservation/reservation.model';

const input: CreateReservationInput = {
  scheduleId: 7,
  participantCount: 2,
  configuration: {
    style: 'GRAND',
    hotelOption: 'HOTEL_4_STAR',
    transportOption: 'PREMIUM_VAN_10',
    mealOption: 'LOCAL_RESTAURANT',
    extraOptions: [],
  },
};

const reservation = {
  id: 801,
  participantCount: 2,
} as ReservationModel;

describe('Reservation mutation controller', () => {
  it('allows only one DataSource call during rapid concurrent submit', async () => {
    let resolveCreate!: (value: ReservationModel) => void;
    const createReservation = vi.fn(
      () =>
        new Promise<ReservationModel>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const controller = createReservationMutationController({ createReservation });

    const first = controller.submit(input);
    const second = await controller.submit(input);

    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: 'submitting' });
    expect(second).toEqual({ status: 'ignored-concurrent-submit' });

    resolveCreate(reservation);
    await expect(first).resolves.toEqual({ status: 'success', reservation });
    expect(controller.getState()).toEqual({ status: 'success', reservation });
  });

  it('performs zero automatic retries after an ordinary failure', async () => {
    const error = new Error('server unavailable');
    const createReservation = vi.fn().mockRejectedValue(error);
    const controller = createReservationMutationController({ createReservation });

    await expect(controller.submit(input)).resolves.toEqual({ status: 'failure', error });
    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: 'failure', error });
  });

  it('marks response-loss network errors as uncertain instead of claiming failure', async () => {
    const error = new ReservationDataSourceError({
      kind: 'network',
      requestMayHaveReachedServer: true,
    });
    const createReservation = vi.fn().mockRejectedValue(error);
    const controller = createReservationMutationController({ createReservation });

    await expect(controller.submit(input)).resolves.toEqual({ status: 'uncertain', error });
    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: 'uncertain', error });
  });

  it('never owns Draft clearing or navigation side effects', () => {
    const controller = createReservationMutationController({
      createReservation: vi.fn().mockResolvedValue(reservation),
    });

    expect(controller).not.toHaveProperty('clearDraft');
    expect(controller).not.toHaveProperty('navigate');
  });
});
