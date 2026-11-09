import {
  ContractMappingError,
  type BackendContractName,
  type ContractMappingFailureReason,
} from '@/integrations/backend/contracts/contractMappingError';

/*
 * Backend 응답 runtime 검증 helper 모음 (CP8, F1-09).
 *
 * CONTRACT: 모든 helper는 기대와 다르면 값을 고치거나 기본값을 넣지 않고
 * ContractMappingError(contract, path, reason)를 던진다. 원본 payload는 오류에 담지 않는다.
 * 정수는 `Number.isSafeInteger`로 확인해 JS가 정확히 표현할 수 없는 값을 거부한다.
 */

/** 검증 실패를 한 형태로 던진다. 반환 타입 `never`로 호출부의 흐름 분석을 돕는다. */
export function mappingFailure(
  contract: BackendContractName,
  path: string,
  reason: ContractMappingFailureReason,
): never {
  throw new ContractMappingError(contract, path, reason);
}

export function expectRecord(
  value: unknown,
  contract: BackendContractName,
  path: string,
): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return mappingFailure(contract, path, 'expected-object');
  }

  return value as Readonly<Record<string, unknown>>;
}

export function expectArray(
  value: unknown,
  contract: BackendContractName,
  path: string,
): readonly unknown[] {
  if (!Array.isArray(value)) {
    return mappingFailure(contract, path, 'expected-array');
  }

  return value;
}

export function expectString(value: unknown, contract: BackendContractName, path: string): string {
  if (typeof value !== 'string') {
    return mappingFailure(contract, path, 'expected-string');
  }

  return value;
}

export function expectBoolean(
  value: unknown,
  contract: BackendContractName,
  path: string,
): boolean {
  if (typeof value !== 'boolean') {
    return mappingFailure(contract, path, 'expected-boolean');
  }

  return value;
}

export function expectPositiveInteger(
  value: unknown,
  contract: BackendContractName,
  path: string,
): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    return mappingFailure(contract, path, 'expected-positive-integer');
  }

  return value;
}

export function expectNonNegativeInteger(
  value: unknown,
  contract: BackendContractName,
  path: string,
): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    return mappingFailure(contract, path, 'expected-non-negative-integer');
  }

  return value;
}

export function expectIntegerInRange(
  value: unknown,
  minimum: number,
  maximum: number,
  contract: BackendContractName,
  path: string,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    return mappingFailure(contract, path, 'expected-integer-range');
  }

  return value;
}

export function expectEnum<const T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
  contract: BackendContractName,
  path: string,
): T[number] {
  const decoded = expectString(value, contract, path);

  if (!allowedValues.includes(decoded)) {
    return mappingFailure(contract, path, 'unknown-enum');
  }

  return decoded;
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number) {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * `YYYY-MM-DD` 형식이면서 실제 달력에 있는 날짜인지 확인한다(윤년 포함).
 * WHY: `Date` parsing은 2026-02-30 같은 값을 다음 달로 넘겨 버리므로 직접 검사한다.
 */
export function expectIsoCalendarDate(
  value: unknown,
  contract: BackendContractName,
  path: string,
): string {
  const decoded = expectString(value, contract, path);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(decoded);

  if (match === null) {
    return mappingFailure(contract, path, 'invalid-date');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return mappingFailure(contract, path, 'invalid-date');
  }

  return decoded;
}

export function expectUniqueEnumArray<const T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
  contract: BackendContractName,
  path: string,
): readonly T[number][] {
  const entries = expectArray(value, contract, path);
  const decoded = entries.map((entry, index) =>
    expectEnum(entry, allowedValues, contract, path + '[' + index + ']'),
  );

  if (new Set(decoded).size !== decoded.length) {
    return mappingFailure(contract, path, 'duplicate-value');
  }

  return decoded;
}
