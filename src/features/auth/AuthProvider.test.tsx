import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, type AuthDataSource, type LoginResult, useAuth } from '@/features/auth';

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
