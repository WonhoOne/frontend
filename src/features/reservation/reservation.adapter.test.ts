import { describe, expect, it } from 'vitest';

import {
  adaptReservationResponseDto,
  toReservationCreateRequestDto,
} from '@/features/reservation/reservation.adapter';
import type { CreateReservationInput } from '@/features/reservation/reservation.model';
import { decodeReservationResponseDto } from '@/integrations/backend/contracts';

const responsePayload = {
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
    extraOptions: ['CHAMPAGNE'],
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

describe('Reservation adapter', () => {
  it('allow-lists the exact Reservation create wire fields', () => {
    const input = {
      scheduleId: 501,
      participantCount: 2,
      configuration: {
        style: 'GRAND',
        hotelOption: 'HOTEL_4_STAR',
        transportOption: 'PRIVATE_LUXURY_CAR_2',
        mealOption: 'LOCAL_RESTAURANT',
        extraOptions: ['COFFEE'],
        price: 99,
      },
      customerId: 101,
      tourId: 201,
      theme: 'HONEYMOON_ROMANCE',
      price: 3_420_000,
      discount: 180_000,
      contact: 'must-not-leak',
      coupleCount: 1,
    } as CreateReservationInput & Record<string, unknown>;

    expect(toReservationCreateRequestDto(input)).toEqual({
      scheduleId: 501,
      participantCount: 2,
      configuration: {
        style: 'GRAND',
        hotelOption: 'HOTEL_4_STAR',
        transportOption: 'PRIVATE_LUXURY_CAR_2',
        mealOption: 'LOCAL_RESTAURANT',
        extraOptions: ['COFFEE'],
      },
    });
  });

  it('maps the shared POST/GET representation to the same server-truth model', () => {
    const dto = decodeReservationResponseDto(responsePayload);

    const postModel = adaptReservationResponseDto(dto);
    const detailModel = adaptReservationResponseDto(dto);

    expect(postModel).toEqual(responsePayload);
    expect(detailModel).toEqual(postModel);
    expect(postModel).not.toHaveProperty('status');
  });

  it('preserves the explicit null discount representation without deriving one', () => {
    const dto = decodeReservationResponseDto({
      ...responsePayload,
      price: {
        ...responsePayload.price,
        discount: null,
        total: responsePayload.price.subtotal,
      },
    });

    expect(adaptReservationResponseDto(dto).price).toEqual({
      unitPrice: 1_800_000,
      subtotal: 3_600_000,
      discount: null,
      total: 3_600_000,
      currency: 'KRW',
    });
  });

  it('copies nested arrays instead of retaining the DTO collection reference', () => {
    const dto = decodeReservationResponseDto(responsePayload);
    const model = adaptReservationResponseDto(dto);

    expect(model.configuration.extraOptions).toEqual(dto.configuration.extraOptions);
    expect(model.configuration.extraOptions).not.toBe(dto.configuration.extraOptions);
  });
});
