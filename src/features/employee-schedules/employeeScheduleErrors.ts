import {
  BackendAuthenticationRequiredError,
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError, decodeApiErrorDto } from '@/integrations/backend/contracts';

/**
 * 출발/완료 처리 결과 분류.
 *
 * `unknown`: 응답을 받지 못했거나 성공 응답을 해석하지 못했다. 다시 보내도 서버가 409로
 * 막으므로 안전하지만, 자동으로 다시 보내지 않고 목록을 다시 읽어 상태를 보여준다.
 */
export type ScheduleOperationOutcome =
  | { kind: 'session-expired' }
  | { kind: 'forbidden' }
  | { kind: 'not-found' }
  | { kind: 'not-confirmed' }
  | { kind: 'already-departed' }
  | { kind: 'not-departed' }
  /** `detail`은 Backend가 사람이 읽도록 만든 부족 품목 설명이다. 분기에는 쓰지 않는다. */
  | { kind: 'insufficient-inventory'; detail: string }
  | { kind: 'server' }
  | { kind: 'unknown' };

const sessionCodes = new Set([
  'AUTHENTICATION_REQUIRED',
  'INVALID_ACCESS_TOKEN',
  'ACCESS_TOKEN_EXPIRED',
]);

/** HTTP status와 안정된 `code`로만 분기한다. */
export function toScheduleOperationOutcome(error: unknown): ScheduleOperationOutcome {
  if (error instanceof BackendAuthenticationRequiredError) {
    return { kind: 'session-expired' };
  }

  if (!(error instanceof BackendHttpError)) {
    return { kind: 'unknown' };
  }

  const status = error.response.status;
  let apiError: ReturnType<typeof decodeApiErrorDto>;

  try {
    apiError = decodeApiErrorDto(error.body);
  } catch {
    return status >= 500 ? { kind: 'server' } : { kind: 'unknown' };
  }

  if (status === 401 && sessionCodes.has(apiError.code)) {
    return { kind: 'session-expired' };
  }

  if (status === 403) {
    return { kind: 'forbidden' };
  }

  if (status === 404) {
    return { kind: 'not-found' };
  }

  if (status === 409) {
    switch (apiError.code) {
      case 'SCHEDULE_NOT_CONFIRMED':
        return { kind: 'not-confirmed' };
      case 'SCHEDULE_ALREADY_DEPARTED':
        return { kind: 'already-departed' };
      case 'SCHEDULE_NOT_DEPARTED':
        return { kind: 'not-departed' };
      case 'INSUFFICIENT_INVENTORY':
        // DELEGATED DECISION: 어떤 품목이 부족한지는 Backend message에만 있으므로 그대로 보여준다.
        return { kind: 'insufficient-inventory', detail: apiError.message };
      default:
        return { kind: 'unknown' };
    }
  }

  if (status >= 500) {
    return { kind: 'server' };
  }

  return { kind: 'unknown' };
}

/** 확인 dialog에 보여줄 문구. session/forbidden은 page가 따로 처리한다. */
export function scheduleOperationMessage(outcome: ScheduleOperationOutcome): string {
  switch (outcome.kind) {
    case 'not-found':
      return '일정을 찾을 수 없습니다. 목록을 새로 고쳤습니다.';
    case 'not-confirmed':
      return '모집이 아직 확정되지 않아 출발 처리할 수 없습니다.';
    case 'already-departed':
      return '이미 출발 처리된 일정입니다. 목록을 새로 고쳤습니다.';
    case 'not-departed':
      return '출발 처리되지 않은 일정은 완료 처리할 수 없습니다. 목록을 새로 고쳤습니다.';
    case 'insufficient-inventory':
      return `재고가 부족해 출발 처리하지 못했습니다. 재고는 바뀌지 않았습니다. ${outcome.detail}`;
    case 'server':
      return '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    case 'session-expired':
      return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
    case 'forbidden':
      return '이 작업을 할 권한이 없습니다.';
    case 'unknown':
      return '처리 결과를 확인하지 못했습니다. 목록을 다시 불러왔으니 상태를 확인해 주세요.';
  }
}

/** 네트워크 오류와 5xx만 한 번 다시 읽는다 (CP5 §2). */
export function shouldRetryScheduleRead(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) {
    return false;
  }

  return (
    error instanceof BackendNetworkError ||
    (error instanceof BackendHttpError && error.response.status >= 500)
  );
}

export function isScheduleReadForbidden(error: unknown): boolean {
  return error instanceof BackendHttpError && error.response.status === 403;
}

export function isScheduleShapeProblem(error: unknown): boolean {
  return error instanceof ContractMappingError || error instanceof BackendMalformedResponseError;
}
