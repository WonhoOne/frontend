// @vitest-environment jsdom

import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { clearPrivateQueryCache, PRIVATE_QUERY_META_KEY } from '@/app/providers/privateQueryCache';
import {
  AuthError,
  AuthProvider,
  type AuthDataSource,
  type LoginResult,
  useAuth,
} from '@/features/auth';
import { reservationQueryKeys } from '@/features/reservation';

const loginResult: LoginResult = {
  accessToken: 'synthetic-token',
  tokenType: 'Bearer',
  expiresIn: 60,
  user: { id: 7, role: 'CUSTOMER', name: 'Synthetic Customer' },
};

describe('auth private cache lifecycle', () => {
  it('removes private query data but preserves public query data on token invalidation', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryDefaults(['private-history'], {
      meta: { privacy: PRIVATE_QUERY_META_KEY },
    });
    queryClient.setQueryData(['private-history'], [{ reservationId: 1 }]);
    queryClient.setQueryDefaults(reservationQueryKeys.detail(801), {
      meta: { privacy: PRIVATE_QUERY_META_KEY },
    });
    queryClient.setQueryData(reservationQueryKeys.detail(801), { id: 801 });
    queryClient.setQueryData(['public-tours'], [{ id: 'tour-1' }]);

    const dataSource: AuthDataSource = {
      login: vi.fn().mockResolvedValue(loginResult),
      signup: vi.fn().mockRejectedValue(new Error('not used')),
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <AuthProvider dataSource={dataSource} onAuthLoss={() => clearPrivateQueryCache(queryClient)}>
        {children}
      </AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.state.status).toBe('unauthenticated'));
    await act(() => result.current.login({ loginId: 'synthetic', password: 'input-only' }));

    act(() => {
      result.current.invalidateSession(new AuthError('INVALID_ACCESS_TOKEN'));
    });

    await waitFor(() => expect(queryClient.getQueryData(['private-history'])).toBeUndefined());
    expect(queryClient.getQueryData(reservationQueryKeys.detail(801))).toBeUndefined();
    expect(queryClient.getQueryData(['public-tours'])).toEqual([{ id: 'tour-1' }]);
  });
});
