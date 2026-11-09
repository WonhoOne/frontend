import { InventoryShapeError } from '@/features/employee-inventory/inventory.adapter';
import {
  BackendAuthenticationRequiredError,
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError, decodeApiErrorDto } from '@/integrations/backend/contracts';

/**
 * 재고 추가 결과 분류 (CP5 §3.3, CP8 §3).
 *
 * `unknown`: 응답을 받지 못했거나 성공 응답을 해석하지 못했다. 이미 더해졌을 수 있으므로
 * 자동으로 다시 보내지 않는다. Inventory POST에는 idempotency key가 없다 (CP0-B).
 */
export type StockAddOutcome =
  | { kind: 'session-expired' }
  | { kind: 'forbidden' }
  | { kind: 'validation' }
  | { kind: 'malformed' }
  | { kind: 'server' }
  | { kind: 'unknown' };

const sessionCodes = new Set([
  'AUTHENTICATION_REQUIRED',
  'INVALID_ACCESS_TOKEN',
  'ACCESS_TOKEN_EXPIRED',
]);

export function toStockAddOutcome(error: unknown): StockAddOutcome {
  if (error instanceof BackendAuthenticationRequiredError) {
    return { kind: 'session-expired' };
  }

  if (!(error instanceof BackendHttpError)) {
    // 네트워크 단절, 중단, 성공 응답 형식 오류 → 결과를 알 수 없다.
    return { kind: 'unknown' };
  }

  const status = error.response.status;
  let code: string;

  try {
    code = decodeApiErrorDto(error.body).code;
  } catch {
    return status >= 500 ? { kind: 'server' } : { kind: 'unknown' };
  }

  if (status === 401 && sessionCodes.has(code)) {
    return { kind: 'session-expired' };
  }

  if (status === 403) {
    return { kind: 'forbidden' };
  }

  if (status === 422) {
    return { kind: 'validation' };
  }

  if (status === 400) {
    return { kind: 'malformed' };
  }

  // Backend는 overflow 등에서 500을 주고 변경하지 않는다 (CP0-B §4).
  if (status >= 500) {
    return { kind: 'server' };
  }

  return { kind: 'unknown' };
}

/** 네트워크 오류와 5xx만 한 번 다시 읽는다 (CP5 §2). */
export function shouldRetryInventoryRead(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) {
    return false;
  }

  return (
    error instanceof BackendNetworkError ||
    (error instanceof BackendHttpError && error.response.status >= 500)
  );
}

export function isInventoryReadForbidden(error: unknown): boolean {
  return error instanceof BackendHttpError && error.response.status === 403;
}

/** 형식이 계약과 다른 응답 (ContractMappingError, 4종이 아닌 목록). */
export function isInventoryShapeProblem(error: unknown): boolean {
  return (
    error instanceof ContractMappingError ||
    error instanceof InventoryShapeError ||
    error instanceof BackendMalformedResponseError
  );
}
