import {
  expectArray,
  expectEnum,
  expectRecord,
  expectString,
} from '@/integrations/backend/contracts/decoder';

export const apiErrorCodes = [
  'MALFORMED_REQUEST',
  'INVALID_QUERY_PARAMETER',
  'LOGIN_FAILED',
  'AUTHENTICATION_REQUIRED',
  'INVALID_ACCESS_TOKEN',
  'ACCESS_TOKEN_EXPIRED',
  'FORBIDDEN',
  'TOUR_PRODUCT_NOT_FOUND',
  'TOUR_SCHEDULE_NOT_FOUND',
  'RESERVATION_NOT_FOUND',
  'SCHEDULE_NOT_RESERVABLE',
  'LOGIN_ID_ALREADY_EXISTS',
  'TOUR_PRODUCT_THEME_LOCKED',
  'VALIDATION_FAILED',
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export const fieldErrorCodes = [
  'REQUIRED',
  'INVALID_FORMAT',
  'INVALID_VALUE',
  'OUT_OF_RANGE',
  'DUPLICATE_VALUE',
  'NOT_ALLOWED',
  'CAPACITY_EXCEEDED',
] as const;

export type FieldErrorCode = (typeof fieldErrorCodes)[number];

export interface ApiFieldErrorDto {
  field: string;
  code: FieldErrorCode;
  message: string;
}

export interface ApiErrorDto {
  code: ApiErrorCode;
  message: string;
  fieldErrors: readonly ApiFieldErrorDto[];
}

export function decodeApiErrorDto(value: unknown): ApiErrorDto {
  const contract = 'ApiError' as const;
  const record = expectRecord(value, contract, '$');
  const fieldErrors = expectArray(record.fieldErrors, contract, '$.fieldErrors').map(
    (fieldError, index): ApiFieldErrorDto => {
      const path = `$.fieldErrors[${index}]`;
      const entry = expectRecord(fieldError, contract, path);

      return {
        field: expectString(entry.field, contract, `${path}.field`),
        code: expectEnum(entry.code, fieldErrorCodes, contract, `${path}.code`),
        message: expectString(entry.message, contract, `${path}.message`),
      };
    },
  );

  return {
    code: expectEnum(record.code, apiErrorCodes, contract, '$.code'),
    message: expectString(record.message, contract, '$.message'),
    fieldErrors,
  };
}
