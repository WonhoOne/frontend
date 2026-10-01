import type {
  CreateReservationInput,
  ReservationModel,
} from '@/features/reservation/reservation.model';

export interface ReservationDataSource {
  /**
   * CONTRACT: Reservation create mutation은 automatic retry를 하지 않는다.
   * 호출 측은 ambiguous outcome을 ordinary failure와 구분해야 한다.
   */
  createReservation(input: CreateReservationInput): Promise<ReservationModel>;
  getReservation(reservationId: number): Promise<ReservationModel>;
}
