// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AuthError, AuthProvider, type AuthDataSource, type LoginResult } from '@/features/auth';
import { LoginPage } from '@/pages/login/LoginPage';

const success: LoginResult = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  expiresIn: 60,
  user: { id: 7, role: 'CUSTOMER', name: 'Test Customer' },
};

function renderLogin(dataSource: AuthDataSource) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <AuthProvider dataSource={dataSource}>{children}</AuthProvider>
  );

  return render(
    <MemoryRouter initialEntries={['/login']}>
      {wrapper({
        children: (
          <Routes>
            <Route element={<LoginPage />} path="/login" />
            <Route element={<p>Home destination</p>} path="/" />
            <Route element={<p>Signup destination</p>} path="/signup" />
          </Routes>
        ),
      })}
    </MemoryRouter>,
  );
}

function dataSource(login: AuthDataSource['login']): AuthDataSource {
  return {
    login,
    signup: vi.fn().mockRejectedValue(new AuthError('UNKNOWN')),
  };
}

async function waitForForm() {
  await screen.findByRole('heading', { name: 'Welcome back' });
  return screen.findByRole('button', { name: '로그인' });
}

describe('LoginPage', () => {
  it('renders only the v0.2 loginId and password credentials with correct semantics', async () => {
    renderLogin(dataSource(vi.fn().mockResolvedValue(success)));
    await waitForForm();

    expect(screen.getByRole('textbox', { name: '로그인 ID' })).toHaveAttribute(
      'autocomplete',
      'username',
    );
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute(
      'autocomplete',
      'current-password',
    );
    expect(screen.queryByLabelText(/email|contact/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/signup');
  });

  it('keeps submit disabled until both required credentials are present', async () => {
    renderLogin(dataSource(vi.fn().mockResolvedValue(success)));
    const submit = await waitForForm();

    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox', { name: '로그인 ID' }), {
      target: { value: 'customer-01' },
    });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'secret-input' },
    });
    expect(submit).toBeEnabled();
  });

  it('submits once, locks editing, and uses the safe home fallback after success', async () => {
    let resolveLogin: ((value: LoginResult) => void) | undefined;
    const login = vi.fn(
      () =>
        new Promise<LoginResult>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    renderLogin(dataSource(login));
    const submit = await waitForForm();

    fireEvent.change(screen.getByRole('textbox', { name: '로그인 ID' }), {
      target: { value: 'customer-01' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'secret-input' },
    });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(login).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '로그인 중' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: '로그인 ID' })).toBeDisabled();
    expect(screen.getByLabelText('비밀번호')).toBeDisabled();

    resolveLogin?.(success);

    expect(await screen.findByText('Home destination')).toBeVisible();
  });

  it('maps LOGIN_FAILED by stable code and preserves both inputs for retry', async () => {
    const login = vi.fn().mockRejectedValue(new AuthError('LOGIN_FAILED'));

    renderLogin(dataSource(login));
    await waitForForm();

    fireEvent.change(screen.getByRole('textbox', { name: '로그인 ID' }), {
      target: { value: 'customer-01' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'secret-input' },
    });
    fireEvent.submit(screen.getByRole('button', { name: '로그인' }).closest('form')!);

    expect(await screen.findByRole('alert', { name: '' })).toHaveTextContent(
      '입력한 로그인 정보를 확인해주세요.',
    );
    expect(screen.getByRole('textbox', { name: '로그인 ID' })).toHaveValue('customer-01');
    expect(screen.getByLabelText('비밀번호')).toHaveValue('secret-input');
    expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled();
  });

  it('uses generic recovery copy for unknown failures without exposing raw errors', async () => {
    const login = vi.fn().mockRejectedValue(new Error('backend secret detail'));

    renderLogin(dataSource(login));
    await waitForForm();

    fireEvent.change(screen.getByRole('textbox', { name: '로그인 ID' }), {
      target: { value: 'customer-01' },
    });
    fireEvent.change(screen.getByLabelText('비밀번호'), {
      target: { value: 'secret-input' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '잠시 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    });
    expect(screen.queryByText('backend secret detail')).not.toBeInTheDocument();
  });
});
