import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import type { ReservationModel } from '@/features/reservation/reservation.model';

export type ReservationLookupState =
  | { status: 'loading' }
  | { status: 'success'; reservation: ReservationModel }
  | { status: 'not-found' }
  | { status: 'network-error'; previous: ReservationModel | null }
  | { status: 'server-error'; previous: ReservationModel | null }
  | { status: 'refreshing'; reservation: ReservationModel };

export async function lookupReservation(
  dataSource: Pick<ReservationDataSource, 'getReservation'>,
  reservationId: number,
  previous: ReservationModel | null = null,
): Promise<ReservationLookupState> {
  try {
    return { status: 'success', reservation: await dataSource.getReservation(reservationId) };
  } catch (error) {
    if (error instanceof ReservationDataSourceError) {
      if (error.detail.kind === 'not-found') return { status: 'not-found' };
      if (error.detail.kind === 'network') return { status: 'network-error', previous };
      if (error.detail.kind === 'server') return { status: 'server-error', previous };
    }
    return { status: 'server-error', previous };
  }
}
