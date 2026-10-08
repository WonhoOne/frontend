import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import {
  adaptReservationResponseDto,
  toReservationCreateRequestDto,
} from '@/features/reservation/reservation.adapter';
import { mapBackendReservationFailure } from '@/features/reservation/backendReservationError';
import type { CreateReservationInput } from '@/features/reservation/reservation.model';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { decodeReservationResponseDto } from '@/integrations/backend/contracts';
import { serializeResourceId } from '@/shared/lib/resourceIdentity';

export class BackendReservationDataSource implements ReservationDataSource {
  constructor(private readonly client: Pick<BackendHttpClient, 'requestJson'>) {}

  async createReservation(input: CreateReservationInput) {
    try {
      const response = await this.client.requestJson({
        path: '/reservations',
        method: 'POST',
        authentication: 'required',
        body: toReservationCreateRequestDto(input),
      });

      return adaptReservationResponseDto(decodeReservationResponseDto(response.body));
    } catch (error) {
      throw mapBackendReservationFailure(error, true);
    }
  }

  async getReservation(reservationId: number) {
    try {
      const response = await this.client.requestJson({
        path: `/reservations/${serializeResourceId(reservationId)}`,
        authentication: 'required',
      });

      return adaptReservationResponseDto(decodeReservationResponseDto(response.body));
    } catch (error) {
      throw mapBackendReservationFailure(error, false);
    }
  }
}
