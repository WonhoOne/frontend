import { describe, expect, it, vi } from 'vitest';

import {
  BackendReservationDataSource,
  ReservationDataSourceError,
  type CreateReservationInput,
} from '@/features/reservation';
import {
  BackendHttpError,
  BackendNetworkError,
} from '@/integrations/backend/client/backendHttpError';

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

function responseBody() {
  return {
    id: 801,
    participantCount: 2,
    tourProduct: {
      id: 201,
      theme: 'HONEYMOON_ROMANCE',
      name: 'Synthetic Honeymoon',
    },
    schedule: {
      id: 501,
      startDate: '2026-11-10',
      endDate: '2026-11-14',
      recruitment: {
        unit: 'COUPLE_TEAM',
        currentCount: 1,
        requiredCount: 2,
        confirmed: false,
      },
    },
    configuration: {
      style: 'GRAND',
      hotelOption: 'HOTEL_4_STAR',
      transportOption: 'PRIVATE_LUXURY_CAR_2',
      mealOption: 'LOCAL_RESTAURANT',
      extraOptions: [],
    },
    price: {
      unitPrice: 1_800_000,
      subtotal: 3_600_000,
      discount: {
        type: 'LOYALTY',
        ratePercent: 5,
        amount: 180_000,
      },
      total: 3_420_000,
      currency: 'KRW',
    },
  };
}

describe('BackendReservationDataSource', () => {
  it('performs one authenticated POST with the exact create contract and returns Backend price truth', async () => {
    const requestJson = vi.fn().mockResolvedValue({
      status: 201,
      statusText: 'Created',
      headers: {},
      body: responseBody(),
    });
    const source = new BackendReservationDataSource({ requestJson });

    await expect(source.createReservation(input)).resolves.toMatchObject({
      id: 801,
      price: {
        subtotal: 3_600_000,
        discount: {
          amount: 180_000,
        },
        total: 3_420_000,
      },
    });

    expect(requestJson).toHaveBeenCalledTimes(1);
    expect(requestJson).toHaveBeenCalledWith({
      path: '/reservations',
      method: 'POST',
      authentication: 'required',
      body: input,
    });
  });

  it('never retries an ambiguous network failure and marks create outcome as uncertain-capable', async () => {
    const requestJson = vi.fn().mockRejectedValue(new BackendNetworkError());
    const source = new BackendReservationDataSource({ requestJson });

    await expect(source.createReservation(input)).rejects.toMatchObject({
      detail: {
        kind: 'network',
        requestMayHaveReachedServer: true,
      },
    });
    expect(requestJson).toHaveBeenCalledTimes(1);
  });

  it('maps stable private 401 codes without retaining the raw ApiError payload', async () => {
    const raw = {
      code: 'ACCESS_TOKEN_EXPIRED',
      message: 'synthetic-sensitive-human-message',
      fieldErrors: [],
    };
    const requestJson = vi.fn().mockRejectedValue(
      new BackendHttpError(
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
        },
        raw,
      ),
    );
    const source = new BackendReservationDataSource({ requestJson });

    let caught: unknown;
    try {
      await source.createReservation(input);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ReservationDataSourceError);
    expect(caught).toMatchObject({
      detail: {
        kind: 'authentication-required',
        code: 'ACCESS_TOKEN_EXPIRED',
      },
    });
    expect(caught).not.toHaveProperty('body');
    expect(JSON.stringify(caught)).not.toContain('synthetic-sensitive-human-message');
  });


  it.each([
    {
      status: 403,
      code: 'FORBIDDEN',
      fieldErrors: [],
      expected: { kind: 'forbidden', code: 'FORBIDDEN' },
    },
    {
      status: 409,
      code: 'SCHEDULE_NOT_RESERVABLE',
      fieldErrors: [
        {
          field: 'scheduleId',
          code: 'INVALID_VALUE',
          message: 'synthetic conflict message',
        },
      ],
      expected: {
        kind: 'conflict',
        code: 'SCHEDULE_NOT_RESERVABLE',
        fieldErrors: [{ field: 'scheduleId', code: 'INVALID_VALUE' }],
      },
    },
    {
      status: 422,
      code: 'VALIDATION_FAILED',
      fieldErrors: [
        {
          field: 'participantCount',
          code: 'OUT_OF_RANGE',
          message: 'synthetic validation message',
        },
        {
          field: 'configuration.transportOption',
          code: 'CAPACITY_EXCEEDED',
          message: 'synthetic capacity message',
        },
      ],
      expected: {
        kind: 'validation',
        code: 'VALIDATION_FAILED',
        fieldErrors: [
          { field: 'participantCount', code: 'OUT_OF_RANGE' },
          { field: 'configuration.transportOption', code: 'CAPACITY_EXCEEDED' },
        ],
      },
    },
    {
      status: 500,
      code: 'INTERNAL_ERROR',
      fieldErrors: [],
      expected: { kind: 'server', code: 'INTERNAL_ERROR' },
    },
  ])(
    'maps HTTP $status using status + stable code/fieldErrors without retaining human messages',
    async ({ status, code, fieldErrors, expected }) => {
      const raw = {
        code,
        message: 'synthetic top-level human message',
        fieldErrors,
      };
      const requestJson = vi.fn().mockRejectedValue(
        new BackendHttpError(
          {
            status,
            statusText: 'Synthetic failure',
            headers: {},
          },
          raw,
        ),
      );
      const source = new BackendReservationDataSource({ requestJson });

      let caught: unknown;
      try {
        await source.createReservation(input);
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(ReservationDataSourceError);
      expect(caught).toMatchObject({ detail: expected });
      expect(caught).not.toHaveProperty('body');
      expect(JSON.stringify(caught)).not.toContain('human message');
      expect(JSON.stringify(caught)).not.toContain('synthetic conflict message');
      expect(JSON.stringify(caught)).not.toContain('synthetic validation message');
      expect(JSON.stringify(caught)).not.toContain('synthetic capacity message');
      expect(requestJson).toHaveBeenCalledTimes(1);
    },
  );

  it('uses the same strict representation adapter for authenticated detail GET', async () => {
    const requestJson = vi.fn().mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: responseBody(),
    });
    const source = new BackendReservationDataSource({ requestJson });

    await expect(source.getReservation(801)).resolves.toMatchObject({
      id: 801,
      configuration: input.configuration,
    });
    expect(requestJson).toHaveBeenCalledWith({
      path: '/reservations/801',
      authentication: 'required',
    });
  });
});
