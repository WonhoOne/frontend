import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import type {
  ReservationConfigurationModel,
  ReservationModel,
} from '@/features/reservation/reservation.model';
import { reservationQueryKeys } from '@/features/reservation/reservation.queryKeys';

/**
 * 예약 configuration 변경 (v0.3 demo). 비관적이며 자동 재시도하지 않는다.
 * 성공하면 Backend가 다시 계산한 Reservation으로 detail cache를 바로 바꾼다.
 */
export function useUpdateReservationConfiguration(
  dataSource: Pick<ReservationDataSource, 'updateReservationConfiguration'>,
  reservationId: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configuration: ReservationConfigurationModel) =>
      dataSource.updateReservationConfiguration(reservationId, configuration),
    retry: 0,
    onSuccess: (updated: ReservationModel) => {
      queryClient.setQueryData(reservationQueryKeys.detail(reservationId), updated);
    },
  });
}
