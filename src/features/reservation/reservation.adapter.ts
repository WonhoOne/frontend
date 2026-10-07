import type {
  CreateReservationInput,
  ReservationModel,
} from '@/features/reservation/reservation.model';
import type {
  ReservationCreateRequestDto,
  ReservationResponseDto,
} from '@/integrations/backend/contracts';

/**
 * Maps the Feature create command to the exact v0.2 wire request.
 *
 * SECURITY/CONTRACT: construct a fresh allow-listed object so unexpected
 * properties on a runtime input can never leak into the private request body.
 */
export function toReservationCreateRequestDto(
  input: CreateReservationInput,
): ReservationCreateRequestDto {
  return {
    scheduleId: input.scheduleId,
    participantCount: input.participantCount,
    configuration: {
      style: input.configuration.style,
      hotelOption: input.configuration.hotelOption,
      transportOption: input.configuration.transportOption,
      mealOption: input.configuration.mealOption,
      extraOptions: [...input.configuration.extraOptions],
    },
  };
}

/**
 * Reservation POST success and GET detail share one Backend representation.
 * This adapter therefore owns both paths and copies server truth into the
 * Feature model without deriving lifecycle state, price, or recruitment.
 */
export function adaptReservationResponseDto(dto: ReservationResponseDto): ReservationModel {
  return {
    id: dto.id,
    participantCount: dto.participantCount,
    tourProduct: {
      id: dto.tourProduct.id,
      theme: dto.tourProduct.theme,
      name: dto.tourProduct.name,
    },
    schedule: {
      id: dto.schedule.id,
      startDate: dto.schedule.startDate,
      endDate: dto.schedule.endDate,
      recruitment: {
        unit: dto.schedule.recruitment.unit,
        currentCount: dto.schedule.recruitment.currentCount,
        requiredCount: dto.schedule.recruitment.requiredCount,
        confirmed: dto.schedule.recruitment.confirmed,
      },
    },
    configuration: {
      style: dto.configuration.style,
      hotelOption: dto.configuration.hotelOption,
      transportOption: dto.configuration.transportOption,
      mealOption: dto.configuration.mealOption,
      extraOptions: [...dto.configuration.extraOptions],
    },
    price: {
      unitPrice: dto.price.unitPrice,
      subtotal: dto.price.subtotal,
      discount:
        dto.price.discount === null
          ? null
          : {
              type: dto.price.discount.type,
              ratePercent: dto.price.discount.ratePercent,
              amount: dto.price.discount.amount,
            },
      total: dto.price.total,
      currency: dto.price.currency,
    },
  };
}
