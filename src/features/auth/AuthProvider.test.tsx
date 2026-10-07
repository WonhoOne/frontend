import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AuthError,
  AuthProvider,
  MemoryAuthSessionStore,
  type AuthDataSource,
  type LoginResult,
  useAuth,
} from '@/features/auth';

const loginResult: LoginResult = {
  accessToken: 'synthetic-token',
  tokenType: 'Bearer',
  expiresIn: 60,
  user: {
    id: 7,
    role: 'CUSTOMER',
    name: 'Synthetic Customer',
  },
};

function createDataSource(): AuthDataSource {
  return {
    login: vi.fn().mockResolvedValue(loginResult),
    signup: vi.fn().mockResolvedValue({
      id: 8,
      role: 'CUSTOMER',
      name: 'New Customer',
    }),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('AuthProvider', () => {
  it('boots checking to unauthenticated without restoring browser storage', async () => {
    const localSet = vi.spyOn(Storage.prototype, 'setItem');
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={createDataSource()}>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));
    expect(localSet).not.toHaveBeenCalled();
  });

  it('keeps bearer material out of public auth state after login', async () => {
    const dataSource = createDataSource();
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={dataSource}>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));

    await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));

    expect(result.current.state).toEqual({
      status: 'authenticated',
      user: loginResult.user,
    });
    expect(result.current.state).not.toHaveProperty('accessToken');
  });

  it('writes the login token only to the injected memory session bridge', async () => {
    const sessionStore = new MemoryAuthSessionStore(() => 1_000);
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={createDataSource()} now={() => 1_000} sessionStore={sessionStore}>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));

    await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));

    expect(sessionStore.getAccessToken()).toBe('synthetic-token');
    expect(sessionStore.getExpiresAt()).toBe(61_000);
    expect(result.current.state).not.toHaveProperty('accessToken');
  });

  it('reacts to transport-owned session clearing as authentication loss', async () => {
    const onAuthLoss = vi.fn();
    const sessionStore = new MemoryAuthSessionStore();
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider
        dataSource={createDataSource()}
        onAuthLoss={onAuthLoss}
        sessionStore={sessionStore}
      >
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));
    await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));

    act(() => sessionStore.clear());

    expect(result.current.state).toEqual({ status: 'unauthenticated' });
    await waitFor(() => expect(onAuthLoss).toHaveBeenCalledTimes(1));
  });

  it('does not auto-login after signup', async () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={createDataSource()}>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));

    await act(() =>
      result.current.signup({
        loginId: 'new-user',
        password: 'input-only',
        name: 'New Customer',
        address: 'Synthetic Address',
        contact: 'Synthetic Contact',
      }),
    );

    expect(result.current.state).toEqual({ status: 'unauthenticated' });
  });

  it('clears private state once when an authenticated session signs out', async () => {
    const onAuthLoss = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={createDataSource()} onAuthLoss={onAuthLoss}>
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));

    await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));
    act(() => result.current.signOut());

    await waitFor(() => expect(onAuthLoss).toHaveBeenCalledTimes(1));
    expect(result.current.state).toEqual({ status: 'unauthenticated' });
  });

  it.each(['AUTHENTICATION_REQUIRED', 'INVALID_ACCESS_TOKEN', 'ACCESS_TOKEN_EXPIRED'] as const)(
    'invalidates an authenticated session on stable token error %s',
    async (code) => {
      const onAuthLoss = vi.fn();
      const wrapper = ({ children }: PropsWithChildren) => (
        <AuthProvider dataSource={createDataSource()} onAuthLoss={onAuthLoss}>
          {children}
        </AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));
      await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));

      let handled = false;
      act(() => {
        handled = result.current.invalidateSession(new AuthError(code));
      });

      expect(handled).toBe(true);
      expect(result.current.state).toEqual({ status: 'unauthenticated' });
      await waitFor(() => expect(onAuthLoss).toHaveBeenCalledTimes(1));
    },
  );

  it('does not invalidate auth for non-token errors or while already unauthenticated', async () => {
    const onAuthLoss = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={createDataSource()} onAuthLoss={onAuthLoss}>
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));

    expect(result.current.invalidateSession(new AuthError('LOGIN_FAILED'))).toBe(false);
    await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));

    expect(result.current.invalidateSession(new AuthError('FORBIDDEN'))).toBe(false);
    expect(result.current.state.status).toBe('authenticated');
    expect(onAuthLoss).not.toHaveBeenCalled();
  });

  it('expires the in-memory session without refresh', async () => {
    vi.useFakeTimers();
    let now = 1_000;
    const onAuthLoss = vi.fn();
    const dataSource: AuthDataSource = {
      ...createDataSource(),
      login: vi.fn().mockResolvedValue({ ...loginResult, expiresIn: 1 }),
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={dataSource} onAuthLoss={onAuthLoss} now={() => now}>
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current.state.status).toBe('unauthenticated');

    await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));
    expect(result.current.state.status).toBe('authenticated');

    now = 2_000;
    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.state).toEqual({ status: 'unauthenticated' });
    expect(onAuthLoss).toHaveBeenCalledTimes(1);
  });
});
