import { describe, expect, it } from 'vitest';

import { ContractMappingError, decodeApiErrorDto } from '@/integrations/backend/contracts';

describe('decodeApiErrorDto', () => {
  it('decodes the v0.2 common API error shape', () => {
    expect(
      decodeApiErrorDto({
        code: 'VALIDATION_FAILED',
        message: 'Synthetic validation failure',
        fieldErrors: [
          {
            field: 'participantCount',
            code: 'OUT_OF_RANGE',
            message: 'Synthetic field failure',
          },
        ],
        requestId: 'allowed-unconsumed-extension',
      }),
    ).toEqual({
      code: 'VALIDATION_FAILED',
      message: 'Synthetic validation failure',
      fieldErrors: [
        {
          field: 'participantCount',
          code: 'OUT_OF_RANGE',
          message: 'Synthetic field failure',
        },
      ],
    });
  });

  it('accepts the public-read stable error codes used by F1', () => {
    for (const code of [
      'MALFORMED_REQUEST',
      'INVALID_QUERY_PARAMETER',
      'TOUR_PRODUCT_NOT_FOUND',
      'TOUR_SCHEDULE_NOT_FOUND',
      'INTERNAL_ERROR',
    ] as const) {
      expect(
        decodeApiErrorDto({
          code,
          message: 'Synthetic error',
          fieldErrors: [],
        }).code,
      ).toBe(code);
    }
  });

  it('accepts the private stable error codes required by F2', () => {
    for (const code of [
      'LOGIN_FAILED',
      'AUTHENTICATION_REQUIRED',
      'INVALID_ACCESS_TOKEN',
      'ACCESS_TOKEN_EXPIRED',
      'FORBIDDEN',
      'RESERVATION_NOT_FOUND',
      'SCHEDULE_NOT_RESERVABLE',
      'LOGIN_ID_ALREADY_EXISTS',
      'VALIDATION_FAILED',
    ] as const) {
      expect(
        decodeApiErrorDto({
          code,
          message: 'Human-readable text must not control flow.',
          fieldErrors: [],
        }).code,
      ).toBe(code);
    }
  });

  it('rejects unknown top-level and field error codes', () => {
    expect(() =>
      decodeApiErrorDto({
        code: 'NEW_UNAPPROVED_ERROR',
        message: 'Synthetic error',
        fieldErrors: [],
      }),
    ).toThrow(ContractMappingError);

    expect(() =>
      decodeApiErrorDto({
        code: 'VALIDATION_FAILED',
        message: 'Synthetic error',
        fieldErrors: [{ field: 'x', code: 'NEW_FIELD_CODE', message: 'x' }],
      }),
    ).toThrow(ContractMappingError);
  });

  it('rejects a missing or malformed fieldErrors array', () => {
    expect(() =>
      decodeApiErrorDto({
        code: 'INTERNAL_ERROR',
        message: 'Synthetic error',
      }),
    ).toThrowError(
      expect.objectContaining({
        path: '$.fieldErrors',
        reason: 'expected-array',
      }),
    );
  });
});
