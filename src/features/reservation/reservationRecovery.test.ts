import { describe, expect, it } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import { getReservationSubmitRecovery } from '@/features/reservation/reservationRecovery';

describe('Reservation 409/422 recovery', () => {
  it('maps SCHEDULE_NOT_RESERVABLE to explicit schedule correction without replacement', () => {
    const recovery = getReservationSubmitRecovery(
      new ReservationDataSourceError({
        kind: 'conflict',
        code: 'SCHEDULE_NOT_RESERVABLE',
        fieldErrors: [{ field: 'scheduleId', code: 'NOT_RESERVABLE' }],
      }),
    );

    expect(recovery).toEqual({
      kind: 'schedule-conflict',
      code: 'SCHEDULE_NOT_RESERVABLE',
      correctionTarget: 'schedule',
      requiresFreshTruth: true,
      requiresReconfirmation: true,
    });
    expect(recovery).not.toHaveProperty('replacementScheduleId');
  });

  it('maps 422 fieldErrors by stable field/code, including transport capacity', () => {
    const recovery = getReservationSubmitRecovery(
      new ReservationDataSourceError({
        kind: 'validation',
        code: 'VALIDATION_FAILED',
        fieldErrors: [
          { field: 'participantCount', code: 'OUT_OF_RANGE' },
          { field: 'configuration.transportOption', code: 'CAPACITY_EXCEEDED' },
          { field: 'configuration.mealOption', code: 'INVALID_OPTION' },
        ],
      }),
    );

    expect(recovery).toEqual({
      kind: 'validation',
      code: 'VALIDATION_FAILED',
      issues: [
        { target: 'participant-count', code: 'OUT_OF_RANGE' },
        { target: 'transport', code: 'CAPACITY_EXCEEDED' },
        { target: 'meal', code: 'INVALID_OPTION' },
      ],
      requiresFreshTruth: false,
      requiresReconfirmation: true,
    });
  });

  it('does not inspect human-readable Error.message', () => {
    const error = new ReservationDataSourceError({
      kind: 'validation',
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ field: 'configuration.hotelOption', code: 'INVALID_OPTION' }],
    });
    error.message = 'schedule unavailable transport capacity price changed';

    expect(getReservationSubmitRecovery(error)).toMatchObject({
      kind: 'validation',
      issues: [{ target: 'hotel', code: 'INVALID_OPTION' }],
    });
  });

  it('does not turn unrelated failures into correction instructions', () => {
    expect(
      getReservationSubmitRecovery(
        new ReservationDataSourceError({ kind: 'server', code: 'INTERNAL_ERROR' }),
      ),
    ).toBeNull();
  });
});
