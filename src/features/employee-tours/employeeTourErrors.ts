import {
  BackendAuthenticationRequiredError,
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
  BackendRequestAbortedError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError, decodeApiErrorDto } from '@/integrations/backend/contracts';

/**
 * 직원 쓰기 요청의 결과 분류다 (CP8 §3).
 *
 * `unknown`은 "실패"가 아니다. 응답을 받지 못했거나 성공 응답을 해석하지 못해
 * Backend에 반영되었는지 알 수 없는 상태다 (CP5 §3.4).
 */
export type EmployeeWriteOutcome =
  | { kind: 'session-expired' }
  | { kind: 'forbidden' }
  | { kind: 'not-found' }
  | { kind: 'theme-locked' }
  | { kind: 'validation'; fieldErrors: ReadonlyArray<{ field: string; code: string }> }
  | { kind: 'malformed' }
  | { kind: 'server' }
  | { kind: 'unknown' };

const sessionCodes = new Set([
  'AUTHENTICATION_REQUIRED',
  'INVALID_ACCESS_TOKEN',
  'ACCESS_TOKEN_EXPIRED',
]);

/**
 * SECURITY: Backend 오류 본문은 이 함수 밖으로 나가지 않는다. 사람이 읽는 `message`로
 * 분기하지 않고 HTTP status와 안정된 `code`만 쓴다.
 */
export function toEmployeeWriteOutcome(error: unknown): EmployeeWriteOutcome {
  if (error instanceof BackendAuthenticationRequiredError) {
    return { kind: 'session-expired' };
  }

  if (
    error instanceof BackendNetworkError ||
    error instanceof BackendRequestAbortedError ||
    error instanceof BackendMalformedResponseError ||
    error instanceof ContractMappingError
  ) {
    return { kind: 'unknown' };
  }

  if (!(error instanceof BackendHttpError)) {
    return { kind: 'unknown' };
  }

  const status = error.response.status;
  let apiError: ReturnType<typeof decodeApiErrorDto>;

  try {
    apiError = decodeApiErrorDto(error.body);
  } catch {
    // 오류 본문이 계약과 다르면 의미를 추측하지 않는다.
    return status >= 500 ? { kind: 'server' } : { kind: 'unknown' };
  }

  const code: string = apiError.code;
  const fieldErrors = apiError.fieldErrors.map(({ field, code: fieldCode }) => ({
    field,
    code: fieldCode,
  }));

  if (status === 401 && sessionCodes.has(code)) {
    return { kind: 'session-expired' };
  }

  if (status === 403) {
    return { kind: 'forbidden' };
  }

  if (status === 404 && code === 'TOUR_PRODUCT_NOT_FOUND') {
    return { kind: 'not-found' };
  }

  if (status === 409 && code === 'TOUR_PRODUCT_THEME_LOCKED') {
    return { kind: 'theme-locked' };
  }

  if (status === 422 && code === 'VALIDATION_FAILED') {
    return { kind: 'validation', fieldErrors };
  }

  if (status === 400 && code === 'MALFORMED_REQUEST') {
    return { kind: 'malformed' };
  }

  if (status >= 500) {
    return { kind: 'server' };
  }

  return { kind: 'unknown' };
}

/** GET 재시도 정책: 네트워크 오류와 5xx만 한 번 다시 시도한다 (CP5 §2). */
export function shouldRetryEmployeeRead(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) {
    return false;
  }

  if (error instanceof BackendNetworkError) {
    return true;
  }

  return error instanceof BackendHttpError && error.response.status >= 500;
}

/** 읽기 실패가 권한 문제인지 구분한다. 화면이 permission state를 그릴 때 쓴다. */
export function isEmployeeReadForbidden(error: unknown): boolean {
  return error instanceof BackendHttpError && error.response.status === 403;
}
