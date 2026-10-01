// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import {
  AuthError,
  AuthProvider,
  type AuthDataSource,
  type SignupResult,
} from '@/features/auth';
import { SignupPage } from '@/pages/signup/SignupPage';

const success: SignupResult = {
  id: 11,
  role: 'CUSTOMER',
  name: 'Test Customer',
};

function renderSignup(dataSource: AuthDataSource) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <AuthProvider dataSource={dataSource}>{children}</AuthProvider>
  );

  return render(
    <MemoryRouter initialEntries={['/signup']}>
      {wrapper({
        children: (
          <Routes>
            <Route element={<SignupPage />} path="/signup" />
            <Route element={<p>Login destination</p>} path="/login" />
          </Routes>
        ),
      })}
    </MemoryRouter>,
  );
}

function dataSource(signup: AuthDataSource['signup']): AuthDataSource {
  return {
    login: vi.fn().mockRejectedValue(new AuthError('LOGIN_FAILED')),
    signup,
  };
}

function fillRequiredFields() {
  fireEvent.change(screen.getByRole('textbox', { name: /로그인 ID/ }), {
    target: { value: 'customer-01' },
  });
  fireEvent.change(screen.getByLabelText(/비밀번호/), {
    target: { value: 'secret-input' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /성명/ }), {
    target: { value: 'Test Customer' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /주소/ }), {
    target: { value: 'Seoul address' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /연락처/ }), {
    target: { value: '010-0000-0000' },
  });
}

describe('SignupPage', () => {
  it('renders exactly the five v0.2 CUSTOMER signup fields with appropriate semantics', () => {
    renderSignup(dataSource(vi.fn().mockResolvedValue(success)));

    const account = screen.getByRole('group', { name: '계정 정보' });
    const profile = screen.getByRole('group', { name: '고객 정보' });

    expect(within(account).getByRole('textbox', { name: /로그인 ID/ })).toHaveAttribute(
      'autocomplete',
      'username',
    );
    expect(within(account).getByLabelText(/비밀번호/)).toHaveAttribute(
      'autocomplete',
      'new-password',
    );
    expect(within(profile).getByRole('textbox', { name: /성명/ })).toHaveAttribute(
      'autocomplete',
      'name',
    );
    expect(within(profile).getByRole('textbox', { name: /주소/ })).toHaveAttribute(
      'autocomplete',
      'street-address',
    );
    expect(within(profile).getByRole('textbox', { name: /연락처/ })).toHaveAttribute(
      'autocomplete',
      'tel',
    );
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.queryByText(/employee|직원/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('requires all five fields without inventing format or password constraints', () => {
    renderSignup(dataSource(vi.fn().mockResolvedValue(success)));

    const submit = screen.getByRole('button', { name: '회원가입' });
    expect(submit).toBeDisabled();

    fillRequiredFields();
    expect(submit).toBeEnabled();
  });

  it('submits the exact v0.2 payload once and returns to Login without auto-login', async () => {
    let resolveSignup: ((value: SignupResult) => void) | undefined;
    const signup = vi.fn(
      () =>
        new Promise<SignupResult>((resolve) => {
          resolveSignup = resolve;
        }),
    );
    const source = dataSource(signup);

    renderSignup(source);
    fillRequiredFields();

    const submit = screen.getByRole('button', { name: '회원가입' });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(signup).toHaveBeenCalledTimes(1);
    expect(signup).toHaveBeenCalledWith({
      loginId: 'customer-01',
      password: 'secret-input',
      name: 'Test Customer',
      address: 'Seoul address',
      contact: '010-0000-0000',
    });
    expect(source.login).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '계정 만드는 중' })).toBeDisabled();

    resolveSignup?.(success);

    expect(await screen.findByText('Login destination')).toBeVisible();
    expect(source.login).not.toHaveBeenCalled();
  });

  it('maps duplicate loginId by stable code and preserves all form input', async () => {
    const signup = vi.fn().mockRejectedValue(new AuthError('LOGIN_ID_ALREADY_EXISTS'));

    renderSignup(dataSource(signup));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '이미 사용 중인 로그인 ID입니다. 다른 ID를 입력하거나 로그인해주세요.',
    );
    expect(screen.getByRole('textbox', { name: /로그인 ID/ })).toHaveValue('customer-01');
    expect(screen.getByLabelText(/비밀번호/)).toHaveValue('secret-input');
    expect(screen.getByRole('textbox', { name: /성명/ })).toHaveValue('Test Customer');
    expect(screen.getByRole('textbox', { name: /주소/ })).toHaveValue('Seoul address');
    expect(screen.getByRole('textbox', { name: /연락처/ })).toHaveValue('010-0000-0000');
    expect(screen.getByRole('button', { name: '회원가입' })).toBeEnabled();
  });

  it('uses stable validation and generic unknown error copy without exposing raw errors', async () => {
    const signup = vi
      .fn()
      .mockRejectedValueOnce(new AuthError('VALIDATION_FAILED'))
      .mockRejectedValueOnce(new Error('private backend detail'));

    renderSignup(dataSource(signup));
    fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '입력한 정보를 확인하고 다시 시도해주세요.',
    );

    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    });
    expect(screen.queryByText('private backend detail')).not.toBeInTheDocument();
  });

  it('offers an accessible path back to Login', () => {
    renderSignup(dataSource(vi.fn().mockResolvedValue(success)));

    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login');
  });
});
