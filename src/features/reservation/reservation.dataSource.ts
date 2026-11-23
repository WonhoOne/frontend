import type {
  CreateReservationInput,
  ReservationConfigurationModel,
  ReservationModel,
} from '@/features/reservation/reservation.model';

export interface ReservationDataSource {
  /**
   * CONTRACT: Reservation create mutation은 automatic retry를 하지 않는다.
   * 호출 측은 ambiguous outcome을 ordinary failure와 구분해야 한다.
   */
  createReservation(input: CreateReservationInput): Promise<ReservationModel>;
  getReservation(reservationId: number): Promise<ReservationModel>;
  /**
   * v0.3 demo: 출발 전 예약의 configuration만 전체 교체한다. 인원과 일정은 바뀌지 않는다.
   * 응답은 Backend가 가격을 다시 계산한 전체 Reservation이다.
   */
  updateReservationConfiguration(
    reservationId: number,
    configuration: ReservationConfigurationModel,
  ): Promise<ReservationModel>;
}
