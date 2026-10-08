import { tourDetailQueryKey, tourScheduleQueryKey } from '@/features/tour-detail';
import { parseBackendResourceIdentity } from '@/shared/lib/resourceIdentity';

export interface ReservationConflictTruthQueryClient {
  refetchQueries(filters: { queryKey: readonly unknown[]; type: 'all' }): Promise<unknown>;
}

/**
 * A 409 means the public product/schedule truth used to build the Draft may be stale.
 * Refetch both approved public resources before asking the customer to correct and
 * reconfirm the transaction. Draft mutation is intentionally not part of this helper.
 */
export async function refreshReservationConflictTruth(
  client: ReservationConflictTruthQueryClient,
  tourProductIdentity: string,
): Promise<boolean> {
  const tourProductId = parseBackendResourceIdentity(tourProductIdentity);
  if (tourProductId === null) {
    return false;
  }

  await Promise.all([
    client.refetchQueries({
      queryKey: tourDetailQueryKey(tourProductId),
      type: 'all',
    }),
    client.refetchQueries({
      queryKey: tourScheduleQueryKey(tourProductId),
      type: 'all',
    }),
  ]);

  return true;
}
