// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GlobalHeader } from '@/app/shell/GlobalHeader';
import { AuthProvider, type AuthDataSource, type LoginResult, useAuth } from '@/features/auth';

const loginResult: LoginResult = {
  accessToken: 'synthetic-token',
  tokenType: 'Bearer',
  expiresIn: 60,
  user: { id: 7, role: 'CUSTOMER', name: 'Synthetic Customer' },
};

function LoginHarness() {
  const auth = useAuth();

  return (
    <button
      disabled={auth.state.status !== 'unauthenticated'}
      onClick={() => void auth.login({ loginId: 'synthetic', password: 'input' })}
    >
      Authenticate
    </button>
  );
}

function renderHeader(initialEntry = '/tours') {
  const dataSource: AuthDataSource = {
    login: vi.fn().mockResolvedValue(loginResult),
    signup: vi.fn().mockRejectedValue(new Error('not used')),
  };

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider dataSource={dataSource}>
        <GlobalHeader />
        <LoginHarness />
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GlobalHeader account state', () => {
  it('keeps the unauthenticated account entry on Login', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'Login / Account' })).toHaveAttribute('href', '/login');
  });

  it('shows the authenticated user summary without inventing an account route', async () => {
    renderHeader();

    const authenticate = screen.getByRole('button', { name: 'Authenticate' });
    await waitFor(() => expect(authenticate).toBeEnabled());
    fireEvent.click(authenticate);

    const account = await screen.findByRole('link', {
      name: 'Account — Synthetic Customer',
    });

    await waitFor(() => expect(account).toHaveAttribute('href', '/my-trips'));
    expect(screen.queryByRole('link', { name: 'Login / Account' })).not.toBeInTheDocument();
  });

  it('keeps My Trips as the route-active item when authenticated account points to the archive', async () => {
    renderHeader('/my-trips');

    const authenticate = screen.getByRole('button', { name: 'Authenticate' });
    await waitFor(() => expect(authenticate).toBeEnabled());
    fireEvent.click(authenticate);

    const myTrips = screen.getByRole('link', { name: 'My Trips' });
    const account = await screen.findByRole('link', {
      name: 'Account — Synthetic Customer',
    });

    expect(myTrips).toHaveAttribute('aria-current', 'page');
    expect(account).not.toHaveAttribute('aria-current');
  });
});
