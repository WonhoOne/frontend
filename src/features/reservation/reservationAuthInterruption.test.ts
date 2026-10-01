import { describe, expect, it, vi } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import { toReservationAuthInterruption } from '@/features/reservation/reservationAuthInterruption';
import { createReservationMutationController } from '@/features/reservation/reservationMutation';
import type { CreateReservationInput } from '@/features/reservation/reservation.model';

const input = {
  scheduleId: 7,
  participantCount: 2,
  configuration: {
    style: 'GRAND',
    hotelOption: 'HOTEL_4_STAR',
    transportOption: 'PREMIUM_VAN_10',
    mealOption: 'LOCAL_RESTAURANT',
    extraOptions: [],
  },
} satisfies CreateReservationInput;

describe('Reservation auth interruption seam', () => {
  it('terminates a 401 submit without retrying or claiming success', async () => {
    const error = new ReservationDataSourceError({
      kind: 'authentication-required',
      code: 'AUTHENTICATION_REQUIRED',
    });
    const createReservation = vi.fn().mockRejectedValue(error);
    const controller = createReservationMutationController({ createReservation });

    const result = await controller.submit(input);

    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: 'auth-interruption',
      code: 'AUTHENTICATION_REQUIRED',
    });
    expect(controller.getState()).toEqual(result);
  });

  it('exposes only a public interruption signal, not auth/navigation ownership', () => {
    const interruption = toReservationAuthInterruption({
      status: 'auth-interruption',
      code: 'AUTHENTICATION_REQUIRED',
    });

    expect(interruption).toMatchObject({
      kind: 'reservation-auth-interruption',
      code: 'AUTHENTICATION_REQUIRED',
    });
    expect(interruption).not.toHaveProperty('returnContext');
    expect(interruption).not.toHaveProperty('token');
    expect(interruption).not.toHaveProperty('loginRoute');
    expect(interruption).not.toHaveProperty('autoResubmit');
  });
});
