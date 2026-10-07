// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AuthProvider, BackendAuthDataSource, MemoryAuthSessionStore } from '@/features/auth';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { server } from '@/mocks/server';
import { SignupPage } from '@/pages/signup/SignupPage';

const baseUrl = 'https://backend.example.test/api/v1';

function fillSignup() {
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

describe('SignupPage live Backend integration', () => {
  it('creates a CUSTOMER through BackendAuthDataSource and returns to Login without auto-login', async () => {
    const sessionStore = new MemoryAuthSessionStore();
    const dataSource = new BackendAuthDataSource(new BackendHttpClient({ baseUrl }));

    server.use(
      http.post(`${baseUrl}/auth/signup`, async ({ request }) => {
        expect(await request.json()).toEqual({
          loginId: 'customer-01',
          password: 'secret-input',
          name: 'Test Customer',
          address: 'Seoul address',
          contact: '010-0000-0000',
        });
        expect(request.headers.get('authorization')).toBeNull();

        return HttpResponse.json(
          {
            id: 202,
            role: 'CUSTOMER',
            name: 'Test Customer',
          },
          { status: 201 },
        );
      }),
    );

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AuthProvider dataSource={dataSource} sessionStore={sessionStore}>
          <Routes>
            <Route element={<SignupPage />} path="/signup" />
            <Route element={<p>Login destination</p>} path="/login" />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    fillSignup();
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(await screen.findByText('Login destination')).toBeVisible();
    expect(sessionStore.getAccessToken()).toBeNull();
  });
});
