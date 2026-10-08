import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import {
  BackendAuthenticationRequiredError,
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError, decodeApiErrorDto } from '@/integrations/backend/contracts';

const authenticationCodes = new Set([
  'AUTHENTICATION_REQUIRED',
  'INVALID_ACCESS_TOKEN',
  'ACCESS_TOKEN_EXPIRED',
]);

function fieldErrors(error: ReturnType<typeof decodeApiErrorDto>) {
  return error.fieldErrors.map(({ field, code }) => ({ field, code }));
}

/**
 * Sanitizes private Reservation transport failures at the DataSource boundary.
 *
 * Raw Backend error payloads never leave this function. Human-readable message
 * text is decoded only as part of the strict ApiError contract and is never
 * used for control flow or retained in Feature errors.
 */
export function mapBackendReservationFailure(
  error: unknown,
  requestMayHaveReachedServer: boolean,
): Error {
  if (error instanceof ReservationDataSourceError || error instanceof ContractMappingError) {
    return error;
  }

  if (error instanceof BackendAuthenticationRequiredError) {
    return new ReservationDataSourceError({
      kind: 'authentication-required',
      code: 'AUTHENTICATION_REQUIRED',
    });
  }

  if (error instanceof BackendNetworkError || error instanceof BackendRequestAbortedError) {
    return new ReservationDataSourceError({
      kind: 'network',
      requestMayHaveReachedServer,
    });
  }

  if (error instanceof BackendMalformedResponseError) {
    return new ReservationDataSourceError({ kind: 'unknown' });
  }

  if (error instanceof BackendHttpError) {
    const apiError = decodeApiErrorDto(error.body);
    const status = error.response.status;

    if (status === 401 && authenticationCodes.has(apiError.code)) {
      return new ReservationDataSourceError({
        kind: 'authentication-required',
        code: apiError.code,
      });
    }

    if (status === 403 && apiError.code === 'FORBIDDEN') {
      return new ReservationDataSourceError({
        kind: 'forbidden',
        code: apiError.code,
      });
    }

    if (status === 404 && apiError.code === 'RESERVATION_NOT_FOUND') {
      return new ReservationDataSourceError({
        kind: 'not-found',
        code: 'RESERVATION_NOT_FOUND',
      });
    }

    if (status === 409) {
      return new ReservationDataSourceError({
        kind: 'conflict',
        code: apiError.code,
        fieldErrors: fieldErrors(apiError),
      });
    }

    if (status === 422) {
      return new ReservationDataSourceError({
        kind: 'validation',
        code: apiError.code,
        fieldErrors: fieldErrors(apiError),
      });
    }

    if (status >= 500) {
      return new ReservationDataSourceError({
        kind: 'server',
        code: apiError.code,
      });
    }

    return new ReservationDataSourceError({ kind: 'unknown' });
  }

  return new ReservationDataSourceError({ kind: 'unknown' });
}
