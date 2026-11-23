import { describe, expect, it, vi } from 'vitest';

import {
  BackendReservationDataSource,
  ReservationDataSourceError,
  type ReservationConfigurationModel,
} from '@/features/reservation';
import { mockHttpError } from '@/features/employee-tours/MockEmployeeTourDataSource';
import { ContractMappingError } from '@/integrations/backend/contracts';

const configuration: ReservationConfigurationModel = {
  style: 'GRAND',
  hotelOption: 'HOTEL_4_STAR',
  transportOption: 'PREMIUM_VAN_10',
  mealOption: 'LOCAL_RESTAURANT',
  extraOptions: ['COFFEE', 'CHAMPAGNE'],
};

function responseBody(id = 801) {
  return {
    id,
    participantCount: 3,
    tourProduct: { id: 2, theme: 'OUTDOOR_TREKKING', name: 'Synthetic Trekking' },
    schedule: {
      id: 5,
      startDate: '2026-12-19',
      endDate: '2026-12-21',
      recruitment: { unit: 'PARTICIPANT', currentCount: 3, requiredCount: 3, confirmed: true },
    },
    configuration: { ...configuration, extraOptions: [...configuration.extraOptions] },
    price: {
      unitPrice: 1_800_000,
      subtotal: 5_400_000,
      discount: null,
      total: 5_400_000,
      currency: 'KRW',
    },
  };
}

describe('BackendReservationDataSource.updateReservationConfiguration', () => {
  it('PUTs only the allow-listed configuration and returns the recalculated reservation', async () => {
    const requestJson = vi
      .fn()
      .mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, body: responseBody() });
    const source = new BackendReservationDataSource({ requestJson });

    await expect(
      source.updateReservationConfiguration(801, {
        ...configuration,
        // runtime extras must not leak into the private request body
        ...({ participantCount: 9 } as object),
      }),
    ).resolves.toMatchObject({ id: 801, price: { total: 5_400_000 } });

    expect(requestJson).toHaveBeenCalledTimes(1);
    expect(requestJson).toHaveBeenCalledWith({
      path: '/reservations/801/configuration',
      method: 'PUT',
      authentication: 'required',
      body: { configuration },
    });
  });

  it('refuses a response for a different reservation', async () => {
    const requestJson = vi
      .fn()
      .mockResolvedValue({ status: 200, statusText: 'OK', headers: {}, body: responseBody(802) });
    const source = new BackendReservationDataSource({ requestJson });

    await expect(source.updateReservationConfiguration(801, configuration)).rejects.toBeInstanceOf(
      ContractMappingError,
    );
  });

  it('maps 409 RESERVATION_NOT_MODIFIABLE to a stable conflict', async () => {
    const requestJson = vi.fn().mockRejectedValue(mockHttpError(409, 'RESERVATION_NOT_MODIFIABLE'));
    const source = new BackendReservationDataSource({ requestJson });

    const error: unknown = await source
      .updateReservationConfiguration(801, configuration)
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ReservationDataSourceError);
    expect(error).toMatchObject({
      detail: { kind: 'conflict', code: 'RESERVATION_NOT_MODIFIABLE' },
    });
  });

  it('maps 422 field errors without the human-readable messages', async () => {
    const requestJson = vi
      .fn()
      .mockRejectedValue(
        mockHttpError(422, 'VALIDATION_FAILED', [
          { field: 'configuration.transportOption', code: 'CAPACITY_EXCEEDED' },
        ]),
      );
    const source = new BackendReservationDataSource({ requestJson });

    await expect(source.updateReservationConfiguration(801, configuration)).rejects.toMatchObject({
      detail: {
        kind: 'validation',
        fieldErrors: [{ field: 'configuration.transportOption', code: 'CAPACITY_EXCEEDED' }],
      },
    });
  });
});
