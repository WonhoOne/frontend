import { describe, expect, it, vi } from 'vitest';

import { createAuthDataSource } from '@/app/providers/authDataSource';
import { AuthError, BackendAuthDataSource, MockAuthDataSource } from '@/features/auth';

function backendLoginResponse() {
  return {
    status: 200,
    statusText: '',
    headers: {},
    body: {
      accessToken: 'synthetic-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 101,
        role: 'CUSTOMER',
        name: 'Synthetic Customer',
      },
    },
  };
}

describe('auth data source composition', () => {
  it('uses the real Backend in production even if the mock flag is configured', async () => {
    const requestJson = vi.fn().mockResolvedValue(backendLoginResponse());
    const source = createAuthDataSource({
      environment: {
        DEV: false,
        VITE_ENABLE_MOCKS: 'true',
      },
      client: { requestJson },
    });

    expect(source).toBeInstanceOf(BackendAuthDataSource);

    await expect(
      source.login({
        loginId: 'customer-1',
        password: 'input-only-password',
      }),
    ).resolves.toMatchObject({
      accessToken: 'synthetic-token',
      user: {
        id: 101,
        role: 'CUSTOMER',
      },
    });
    expect(requestJson).toHaveBeenCalledTimes(1);
  });

  it('uses the real Backend in development when mocks are not explicitly enabled', () => {
    const source = createAuthDataSource({
      environment: {
        DEV: true,
        VITE_ENABLE_MOCKS: 'false',
      },
      client: { requestJson: vi.fn() },
    });

    expect(source).toBeInstanceOf(BackendAuthDataSource);
  });

  it('permits MockAuthDataSource only for explicit DEV mock mode', async () => {
    const requestJson = vi.fn();
    const source = createAuthDataSource({
      environment: {
        DEV: true,
        VITE_ENABLE_MOCKS: 'true',
      },
      client: { requestJson },
    });

    expect(source).toBeInstanceOf(MockAuthDataSource);
    await expect(
      source.login({
        loginId: 'synthetic',
        password: 'input-only',
      }),
    ).rejects.toEqual(expect.objectContaining({ code: 'LOGIN_FAILED' }));
    expect(requestJson).not.toHaveBeenCalled();
  });

  it('does not silently fall back to mock auth when the real Backend fails', async () => {
    const requestJson = vi.fn().mockRejectedValue(new Error('synthetic transport failure'));
    const source = createAuthDataSource({
      environment: {
        DEV: false,
      },
      client: { requestJson },
    });

    await expect(
      source.login({
        loginId: 'customer-1',
        password: 'input-only-password',
      }),
    ).rejects.toEqual(expect.objectContaining<AuthError>({ code: 'UNKNOWN' }));
    expect(requestJson).toHaveBeenCalledTimes(1);
  });
});
