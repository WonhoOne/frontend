import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import {
  adaptReservationResponseDto,
  toReservationConfigurationUpdateRequestDto,
  toReservationCreateRequestDto,
} from '@/features/reservation/reservation.adapter';
import { mapBackendReservationFailure } from '@/features/reservation/backendReservationError';
import type {
  CreateReservationInput,
  ReservationConfigurationModel,
} from '@/features/reservation/reservation.model';
import type { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import {
  ContractMappingError,
  decodeReservationResponseDto,
} from '@/integrations/backend/contracts';
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

  async updateReservationConfiguration(
    reservationId: number,
    configuration: ReservationConfigurationModel,
  ) {
    try {
      const response = await this.client.requestJson({
        path: `/reservations/${serializeResourceId(reservationId)}/configuration`,
        method: 'PUT',
        authentication: 'required',
        body: toReservationConfigurationUpdateRequestDto(configuration),
      });
      const dto = decodeReservationResponseDto(response.body);

      // CONTRACT: 다른 예약의 응답으로 화면을 덮어쓰지 않는다.
      if (dto.id !== reservationId) {
        throw new ContractMappingError('Reservation', '$.id', 'resource-identity-mismatch');
      }

      return adaptReservationResponseDto(dto);
    } catch (error) {
      // PUT은 전체 교체라 결과를 모를 때 다시 읽어 확인하면 된다.
      throw mapBackendReservationFailure(error, true);
    }
  }
}
