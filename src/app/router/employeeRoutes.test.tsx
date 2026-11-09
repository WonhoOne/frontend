// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { appRoutes } from '@/app/router/routes';
import {
  AuthError,
  AuthProvider,
  type AuthDataSource,
  type LoginInput,
  type LoginResult,
  useAuth,
} from '@/features/auth';

function loginResultFor(role: 'CUSTOMER' | 'EMPLOYEE'): LoginResult {
  return {
    accessToken: `${role.toLowerCase()}-token`,
    tokenType: 'Bearer',
    expiresIn: 3600,
    user:
      role === 'EMPLOYEE'
        ? { id: 201, role, name: 'Synthetic Employee' }
        : { id: 7, role, name: 'Synthetic Customer' },
  };
}

function createAuthSource() {
  const login = vi.fn((input: LoginInput) => {
    if (input.loginId === 'employee') {
      return Promise.resolve(loginResultFor('EMPLOYEE'));
    }

    if (input.loginId === 'short-employee') {
      return Promise.resolve({ ...loginResultFor('EMPLOYEE'), expiresIn: 1 });
    }

    if (input.loginId === 'customer') {
      return Promise.resolve(loginResultFor('CUSTOMER'));
    }

    return Promise.reject(new AuthError('LOGIN_FAILED'));
  });
  const source: AuthDataSource = {
    login,
    signup: vi.fn().mockRejectedValue(new Error('not used')),
  };

  return { source, login };
}

/** Router 밖에서 고객 session을 만든다 (고객으로 로그인한 뒤 직원 화면에 오는 경우). */
function CustomerSessionSeed({ onReady }: { onReady: () => void }) {
  const auth = useAuth();
  const seededRef = useRef(false);

  useEffect(() => {
    // 한 번만 seed한다. 이후 로그아웃 흐름에서 다시 로그인하지 않게 한다.
    if (!seededRef.current && auth.state.status === 'unauthenticated') {
      seededRef.current = true;
      void auth
        .login({ loginId: 'customer', password: 'input' }, { expectedRole: 'CUSTOMER' })
        .then(onReady);
    }
  }, [auth, onReady]);

  return null;
}

function renderEmployee(path: string, options: { onCustomerSession?: () => void } = {}) {
  const { source, login } = createAuthSource();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider dataSource={source}>
        {options.onCustomerSession === undefined ? null : (
          <CustomerSessionSeed onReady={options.onCustomerSession} />
        )}
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  );

  return { router, login };
}

async function signIn(loginId: string, password = 'input-only') {
  fireEvent.change(await screen.findByLabelText(/아이디/), { target: { value: loginId } });
  fireEvent.change(screen.getByLabelText(/비밀번호/), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: '로그인' }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Employee routes', () => {
  it('sends an anonymous visitor from /employee to the Employee login with a safe returnTo', async () => {
    const { router } = renderEmployee('/employee');

    expect(await screen.findByRole('heading', { level: 1, name: '직원 로그인' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/login');
    expect(new URLSearchParams(router.state.location.search).get('returnTo')).toBe(
      '/employee/tours',
    );
  });

  it('signs in an EMPLOYEE into the shell without any Customer chrome', async () => {
    const { router } = renderEmployee('/employee/login');

    await signIn('employee');

    expect(await screen.findByRole('heading', { level: 1, name: '여행상품' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/tours');

    const nav = screen.getByRole('navigation', { name: '직원 메뉴' });
    expect(nav).toHaveTextContent('여행상품');
    expect(nav).toHaveTextContent('재고 관리');
    expect(screen.getByText('Synthetic Employee')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Login / Account' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /My Trips/ })).not.toBeInTheDocument();
  });

  it('returns to the validated protected page after sign-in', async () => {
    const { router } = renderEmployee('/employee/inventory');

    await screen.findByRole('heading', { level: 1, name: '직원 로그인' });
    await signIn('employee');

    expect(await screen.findByRole('heading', { level: 1, name: '재고 관리' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/inventory');
  });

  it('ignores a returnTo outside the Employee area', async () => {
    const { router } = renderEmployee('/employee/login?returnTo=%2Fmy-trips');

    await signIn('employee');

    await screen.findByRole('heading', { level: 1, name: '여행상품' });
    expect(router.state.location.pathname).toBe('/employee/tours');
  });

  it('refuses CUSTOMER credentials and keeps no session', async () => {
    const { router } = renderEmployee('/employee/login');

    await signIn('customer');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '직원 계정이 아닙니다. 직원 계정으로 로그인해 주세요.',
    );
    expect(router.state.location.pathname).toBe('/employee/login');
    expect(screen.queryByRole('navigation', { name: '직원 메뉴' })).not.toBeInTheDocument();
  });

  it('shows a generic failure for wrong credentials and clears the password', async () => {
    renderEmployee('/employee/login');

    await signIn('wrong', 'secret-input');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '아이디 또는 비밀번호가 올바르지 않습니다.',
    );
    expect(screen.getByLabelText(/비밀번호/)).toHaveValue('');
    expect(screen.getByLabelText(/아이디/)).toHaveValue('wrong');
  });

  it('validates empty fields without calling the login API', async () => {
    const { login } = renderEmployee('/employee/login');

    fireEvent.click(await screen.findByRole('button', { name: '로그인' }));

    expect(await screen.findByText('아이디를 입력해 주세요.')).toBeVisible();
    expect(screen.getByText('비밀번호를 입력해 주세요.')).toBeVisible();
    expect(login).not.toHaveBeenCalled();
  });

  it('shows the permission state, not a redirect loop, for a CUSTOMER session', async () => {
    const customerReady = vi.fn();
    const { router } = renderEmployee('/employee/login', { onCustomerSession: customerReady });
    await waitFor(() => expect(customerReady).toHaveBeenCalled());

    await router.navigate('/employee/tours');

    expect(
      await screen.findByRole('heading', { level: 1, name: '직원 전용 화면입니다' }),
    ).toBeVisible();
    expect(screen.getByText('현재 고객 계정으로 로그인되어 있습니다.')).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/tours');
    expect(screen.queryByRole('navigation', { name: '직원 메뉴' })).not.toBeInTheDocument();
  });

  it('shows the Employee not-found state for an unknown Employee path', async () => {
    renderEmployee('/employee/login?returnTo=%2Femployee%2Funknown');

    await signIn('employee');

    expect(
      await screen.findByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: '여행상품 목록으로' })).toHaveAttribute(
      'href',
      '/employee/tours',
    );
  });

  it('keeps the page and offers sign-in again when the session expires', async () => {
    const { router } = renderEmployee('/employee/login?returnTo=%2Femployee%2Finventory');

    await signIn('short-employee');
    await screen.findByRole('heading', { level: 1, name: '재고 관리' });

    // SAFETY: no automatic redirect — the page (and any input) stays until the user acts.
    const banner = await screen.findByRole('alert', {}, { timeout: 3000 });
    expect(banner).toHaveTextContent('세션이 만료되었습니다.');
    expect(screen.getByRole('heading', { level: 1, name: '재고 관리' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/inventory');

    fireEvent.click(screen.getByRole('button', { name: '다시 로그인' }));

    expect(await screen.findByText('세션이 만료되어 다시 로그인해야 합니다.')).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/login');
    expect(new URLSearchParams(router.state.location.search).get('returnTo')).toBe(
      '/employee/inventory',
    );
  });

  it('switches a CUSTOMER session to Employee login from the permission state', async () => {
    const customerReady = vi.fn();
    const { router } = renderEmployee('/employee/login', { onCustomerSession: customerReady });
    await waitFor(() => expect(customerReady).toHaveBeenCalled());
    await router.navigate('/employee/tours');

    fireEvent.click(await screen.findByRole('button', { name: '직원 계정으로 다시 로그인' }));

    expect(await screen.findByText('로그아웃했습니다.')).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/login');
  });

  it('signs out to the login page with a notice and removes the shell', async () => {
    const { router } = renderEmployee('/employee/login');

    await signIn('employee');
    await screen.findByRole('heading', { level: 1, name: '여행상품' });

    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(await screen.findByText('로그아웃했습니다.')).toBeVisible();
    expect(router.state.location.pathname).toBe('/employee/login');
    await waitFor(() =>
      expect(screen.queryByRole('navigation', { name: '직원 메뉴' })).not.toBeInTheDocument(),
    );

    await router.navigate('/employee/tours');
    await waitFor(() =>
      expect(new URLSearchParams(router.state.location.search).get('returnTo')).toBe(
        '/employee/tours',
      ),
    );
    expect(await screen.findByRole('heading', { level: 1, name: '직원 로그인' })).toBeVisible();
  });
});
