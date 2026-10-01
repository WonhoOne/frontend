// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, type AuthDataSource, type LoginResult, useAuth } from '@/features/auth';
import {
  clearPostLoginHistoryIntent,
  PostLoginPreviousTripsSurface,
  setPostLoginHistoryIntent,
  type TravelHistoryDataSource,
} from '@/features/travel-history';

const loginResult: LoginResult = {
  accessToken: 'synthetic-token',
  tokenType: 'Bearer',
  expiresIn: 60,
  user: { id: 7, role: 'CUSTOMER', name: 'Synthetic Customer' },
};

function installDesktopMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: true,
      media: '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

function Harness() {
  const auth = useAuth();

  return (
    <>
      <button onClick={() => void auth.login({ loginId: 'synthetic', password: 'input' })}>
        Authenticate
      </button>
    </>
  );
}

function renderSurface(historySource: TravelHistoryDataSource) {
  installDesktopMatchMedia();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authSource: AuthDataSource = {
    login: vi.fn().mockResolvedValue(loginResult),
    signup: vi.fn().mockRejectedValue(new Error('not used')),
  };

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider dataSource={authSource}>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  render(
    wrapper({
      children: (
        <>
          <Harness />
          <PostLoginPreviousTripsSurface
            dataSource={historySource}
            onExplore={() => undefined}
            onViewAll={() => undefined}
          />
        </>
      ),
    }),
  );
}

afterEach(() => {
  clearPostLoginHistoryIntent();
  vi.restoreAllMocks();
});

describe('PostLoginPreviousTripsSurface', () => {
  it('opens once after a normal successful login intent', async () => {
    renderSurface({ getTravelHistory: vi.fn().mockResolvedValue([]) });

    setPostLoginHistoryIntent('show-previous-trips');
    act(() => {
      screen.getByRole('button', { name: 'Authenticate' }).click();
    });

    expect(await screen.findByRole('dialog', { name: 'Your previous trips' })).toBeVisible();
  });

  it('suppresses the popup for transaction/navigation recovery login', async () => {
    const getTravelHistory = vi.fn().mockResolvedValue([]);
    renderSurface({ getTravelHistory });

    setPostLoginHistoryIntent('suppress');
    act(() => {
      screen.getByRole('button', { name: 'Authenticate' }).click();
    });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(getTravelHistory).not.toHaveBeenCalled();
  });
});
