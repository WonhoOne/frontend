import { describe, expect, it } from 'vitest';

import {
  ContractMappingError,
  decodeLoginResponseDto,
  decodeSignupResponseDto,
} from '@/integrations/backend/contracts';

const loginResponse = {
  accessToken: 'synthetic-access-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {
    id: 101,
    role: 'CUSTOMER',
    name: 'Synthetic Customer',
  },
};

describe('Auth runtime contract', () => {
  it('decodes the approved login representation', () => {
    expect(
      decodeLoginResponseDto({ ...loginResponse, ignored: 'extension' }),
    ).toEqual(loginResponse);
  });

  it('accepts the Backend-supported EMPLOYEE role at the wire boundary', () => {
    expect(
      decodeLoginResponseDto({
        ...loginResponse,
        user: { ...loginResponse.user, role: 'EMPLOYEE' },
      }).user.role,
    ).toBe('EMPLOYEE');
  });

  it.each([
    ['wrong token type', { ...loginResponse, tokenType: 'Basic' }, '$.tokenType', 'unknown-enum'],
    ['zero expiry', { ...loginResponse, expiresIn: 0 }, '$.expiresIn', 'expected-positive-integer'],
    [
      'unsafe user id',
      { ...loginResponse, user: { ...loginResponse.user, id: Number.MAX_SAFE_INTEGER + 1 } },
      '$.user.id',
      'expected-positive-integer',
    ],
    [
      'unknown role',
      { ...loginResponse, user: { ...loginResponse.user, role: 'ADMIN' } },
      '$.user.role',
      'unknown-enum',
    ],
  ] as const)('rejects %s', (_name, payload, path, reason) => {
    expect(() => decodeLoginResponseDto(payload)).toThrowError(
      expect.objectContaining({ path, reason }),
    );
  });

  it('decodes signup success without treating signup as login', () => {
    expect(
      decodeSignupResponseDto({
        id: 102,
        role: 'CUSTOMER',
        name: 'New Customer',
        accessToken: 'must-not-be-consumed',
      }),
    ).toEqual({
      id: 102,
      role: 'CUSTOMER',
      name: 'New Customer',
    });
  });

  it('rejects a non-CUSTOMER signup role', () => {
    expect(() =>
      decodeSignupResponseDto({
        id: 102,
        role: 'EMPLOYEE',
        name: 'Unexpected Employee',
      }),
    ).toThrowError(
      expect.objectContaining({
        contract: 'AuthSignupResponse',
        path: '$.role',
        reason: 'unknown-enum',
      }),
    );
  });

  it('does not retain malformed private payload content on ContractMappingError', () => {
    const secret = 'never-retain-this-token';

    try {
      decodeLoginResponseDto({
        ...loginResponse,
        accessToken: secret,
        expiresIn: 'invalid',
      });
      throw new Error('Expected decode to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(ContractMappingError);
      expect(String(error)).not.toContain(secret);
      expect(JSON.stringify(error)).not.toContain(secret);
    }
  });
});
