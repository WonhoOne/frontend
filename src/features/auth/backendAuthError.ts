import { AuthError, type AuthErrorCode } from '@/features/auth/authTypes';
import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import {
  ContractMappingError,
  decodeApiErrorDto,
  type ApiErrorCode,
} from '@/integrations/backend/contracts';

const authCodeByHttpContract = new Map<string, AuthErrorCode>([
  ['401:LOGIN_FAILED', 'LOGIN_FAILED'],
  ['401:AUTHENTICATION_REQUIRED', 'AUTHENTICATION_REQUIRED'],
  ['401:INVALID_ACCESS_TOKEN', 'INVALID_ACCESS_TOKEN'],
  ['401:ACCESS_TOKEN_EXPIRED', 'ACCESS_TOKEN_EXPIRED'],
  ['403:FORBIDDEN', 'FORBIDDEN'],
  ['409:LOGIN_ID_ALREADY_EXISTS', 'LOGIN_ID_ALREADY_EXISTS'],
  ['422:VALIDATION_FAILED', 'VALIDATION_FAILED'],
]);

function contractKey(status: number, code: ApiErrorCode) {
  return String(status) + ':' + code;
}

export function mapBackendAuthFailure(error: unknown): Error {
  if (error instanceof AuthError || error instanceof ContractMappingError) {
    return error;
  }

  if (error instanceof BackendHttpError) {
    const apiError = decodeApiErrorDto(error.body);
    const code = authCodeByHttpContract.get(contractKey(error.response.status, apiError.code));

    return new AuthError(code ?? 'UNKNOWN');
  }

  if (
    error instanceof BackendNetworkError ||
    error instanceof BackendMalformedResponseError ||
    error instanceof BackendRequestAbortedError
  ) {
    return new AuthError('UNKNOWN');
  }

  return new AuthError('UNKNOWN');
}
