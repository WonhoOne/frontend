import type { ReservationCreateIdentityResolver } from '@/features/reservation/reservationCreateIntent';
import {
  extraOptions,
  hotelOptions,
  mealOptions,
  transportOptions,
} from '@/integrations/backend/contracts';
import { parseBackendResourceIdentity } from '@/shared/lib/resourceIdentity';

function resolveCanonicalOption<const T extends readonly string[]>(
  selectionKey: string,
  allowed: T,
): T[number] | null {
  return allowed.find((option) => option === selectionKey) ?? null;
}

/**
 * Production Reservation create identity boundary.
 *
 * Shared v0.2 defines configuration option IDs as the enum literals themselves.
 * Opaque fixture keys are intentionally rejected here and remain a DEV/test concern.
 */
export const canonicalReservationCreateIdentityResolver: ReservationCreateIdentityResolver = {
  resolveScheduleId: (selectionIdentity) => parseBackendResourceIdentity(selectionIdentity),
  resolveHotelOption: (selectionKey) => resolveCanonicalOption(selectionKey, hotelOptions),
  resolveTransportOption: (selectionKey) =>
    resolveCanonicalOption(selectionKey, transportOptions),
  resolveMealOption: (selectionKey) => resolveCanonicalOption(selectionKey, mealOptions),
  resolveExtraOption: (selectionKey) => resolveCanonicalOption(selectionKey, extraOptions),
};
