import { describe, expect, it, vi } from 'vitest';

import { BackendAuthDataSource } from '@/features/auth/BackendAuthDataSource';
import { AuthError } from '@/features/auth/authTypes';
import {
  BackendHttpError,
  BackendMalformedResponseError,
  BackendNetworkError,
} from '@/integrations/backend/client/backendHttpError';
import { ContractMappingError } from '@/integrations/backend/contracts';

const authErrorCases = [
  [401, 'LOGIN_FAILED', 'LOGIN_FAILED'],
  [409, 'LOGIN_ID_ALREADY_EXISTS', 'LOGIN_ID_ALREADY_EXISTS'],
  [422, 'VALIDATION_FAILED', 'VALIDATION_FAILED'],
  [401, 'AUTHENTICATION_REQUIRED', 'AUTHENTICATION_REQUIRED'],
  [401, 'INVALID_ACCESS_TOKEN', 'INVALID_ACCESS_TOKEN'],
  [401, 'ACCESS_TOKEN_EXPIRED', 'ACCESS_TOKEN_EXPIRED'],
  [403, 'FORBIDDEN', 'FORBIDDEN'],
] as const;

function backendResponse(body: unknown) {
  return {
    status: 200,
    statusText: '',
    headers: {},
    body,
  };
}

function createdBackendResponse(body: unknown) {
  return {
    status: 201,
    statusText: '',
    headers: {},
    body,
  };
}

function httpError(status: number, body: unknown) {
  return new BackendHttpError(
    {
      status,
      statusText: '',
      headers: {},
    },
    body,
  );
}

describe('BackendAuthDataSource', () => {
  it('posts only the approved login fields and adapts a CUSTOMER response', async () => {
    const requestJson = vi.fn().mockResolvedValue(
      backendResponse({
        accessToken: 'synthetic-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: 101,
          role: 'CUSTOMER',
          name: 'Synthetic Customer',
        },
      }),
    );
    const source = new BackendAuthDataSource({ requestJson });
    const input = {
      loginId: 'customer-1',
      password: 'input-only-password',
      ignoredByAdapter: 'must-not-be-sent',
    };

    const result = await source.login(input);

    expect(requestJson).toHaveBeenCalledWith({
      path: '/auth/login',
      method: 'POST',
      body: {
        loginId: 'customer-1',
        password: 'input-only-password',
      },
    });
    expect(result).toEqual({
      accessToken: 'synthetic-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 101,
        role: 'CUSTOMER',
        name: 'Synthetic Customer',
      },
    });
  });

  it('posts only the approved signup fields and never treats signup as login', async () => {
    const requestJson = vi.fn().mockResolvedValue(
      createdBackendResponse({
        id: 102,
        role: 'CUSTOMER',
        name: 'New Customer',
      }),
    );
    const source = new BackendAuthDataSource({ requestJson });
    const input = {
      loginId: 'new-customer',
      password: 'signup-input-only-password',
      name: 'New Customer',
      address: 'Synthetic Address',
      contact: '010-0000-0000',
      accessToken: 'must-not-be-sent',
    };

    const result = await source.signup(input);

    expect(requestJson).toHaveBeenCalledWith({
      path: '/auth/signup',
      method: 'POST',
      body: {
        loginId: 'new-customer',
        password: 'signup-input-only-password',
        name: 'New Customer',
        address: 'Synthetic Address',
        contact: '010-0000-0000',
      },
    });
    expect(result).toEqual({
      id: 102,
      role: 'CUSTOMER',
      name: 'New Customer',
    });
    expect(result).not.toHaveProperty('accessToken');
  });

  it.each(authErrorCases)(
    'maps HTTP %i + %s by stable code instead of human message',
    async (status, backendCode, expectedCode) => {
      const requestJson = vi.fn().mockRejectedValue(
        httpError(status, {
          code: backendCode,
          message: 'Misleading human text: ACCESS_TOKEN_EXPIRED LOGIN_FAILED',
          fieldErrors: [],
        }),
      );
      const source = new BackendAuthDataSource({ requestJson });
      const pending = source.login({ loginId: 'synthetic', password: 'input-only' });

      await expect(pending).rejects.toEqual(expect.objectContaining({ code: expectedCode }));
    },
  );

  it('does not accept a stable code under the wrong HTTP status', async () => {
    const requestJson = vi.fn().mockRejectedValue(
      httpError(500, {
        code: 'LOGIN_FAILED',
        message: 'Human text must not override the status.',
        fieldErrors: [],
      }),
    );
    const source = new BackendAuthDataSource({ requestJson });
    const pending = source.login({ loginId: 'synthetic', password: 'input-only' });

    await expect(pending).rejects.toEqual(expect.objectContaining({ code: 'UNKNOWN' }));
  });

  it('rejects an EMPLOYEE login before creating a customer-app AuthUser', async () => {
    const requestJson = vi.fn().mockResolvedValue(
      backendResponse({
        accessToken: 'employee-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: 201,
          role: 'EMPLOYEE',
          name: 'Synthetic Employee',
        },
      }),
    );
    const source = new BackendAuthDataSource({ requestJson });
    const pending = source.login({ loginId: 'employee', password: 'input-only' });

    await expect(pending).rejects.toEqual(expect.objectContaining({ code: 'FORBIDDEN' }));
  });

  it('surfaces malformed API error contracts instead of hiding drift', async () => {
    const requestJson = vi.fn().mockRejectedValue(
      httpError(401, {
        code: 'NEW_UNAPPROVED_AUTH_CODE',
        message: 'Synthetic message',
        fieldErrors: [],
      }),
    );
    const source = new BackendAuthDataSource({ requestJson });
    const pending = source.login({ loginId: 'synthetic', password: 'input-only' });

    await expect(pending).rejects.toBeInstanceOf(ContractMappingError);
  });

  it.each([
    new BackendNetworkError(),
    new BackendMalformedResponseError(
      { status: 200, statusText: '', headers: {} },
      'invalid-json',
    ),
  ])('maps transport failure %s to UNKNOWN AuthError', async (failure) => {
    const source = new BackendAuthDataSource({
      requestJson: vi.fn().mockRejectedValue(failure),
    });
    const pending = source.login({ loginId: 'synthetic', password: 'input-only' });

    await expect(pending).rejects.toEqual(expect.objectContaining({ code: 'UNKNOWN' }));
  });

  it(
    'does not retain credentials or raw private error extensions in the mapped AuthError',
    async () => {
      const loginId = 'private-login-marker';
      const password = 'private-password-marker';
      const echoedPrivateValue = 'private-backend-extension';
      const requestJson = vi.fn().mockRejectedValue(
        httpError(401, {
          code: 'LOGIN_FAILED',
          message: 'Generic login failure.',
          fieldErrors: [],
          loginId,
          password,
          echoedPrivateValue,
        }),
      );
      const source = new BackendAuthDataSource({ requestJson });

      let mappedError: unknown;
      try {
        await source.login({ loginId, password });
      } catch (error) {
        mappedError = error;
      }

      expect(mappedError).toBeInstanceOf(AuthError);
      expect(String(mappedError)).not.toContain(loginId);
      expect(String(mappedError)).not.toContain(password);
      expect(String(mappedError)).not.toContain(echoedPrivateValue);
      expect(JSON.stringify(mappedError)).not.toContain(loginId);
      expect(JSON.stringify(mappedError)).not.toContain(password);
      expect(JSON.stringify(mappedError)).not.toContain(echoedPrivateValue);
    },
  );
});
