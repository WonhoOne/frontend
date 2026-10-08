// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import {
  AuthProvider,
  BackendAuthDataSource,
  clearReturnContext,
  MemoryAuthSessionStore,
  saveReturnContext,
  RETURN_CONTEXT_STORAGE_KEY,
} from '@/features/auth';
import { BackendHttpClient } from '@/integrations/backend/client/backendClient';
import { server } from '@/mocks/server';
import { LoginPage } from '@/pages/login/LoginPage';

const baseUrl = 'https://backend.example.test/api/v1';

function renderLiveLogin(sessionStore: MemoryAuthSessionStore) {
  const dataSource = new BackendAuthDataSource(new BackendHttpClient({ baseUrl }));

  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider dataSource={dataSource} sessionStore={sessionStore}>
        <Routes>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<p>My Trips destination</p>} path="/my-trips" />
          <Route element={<p>Safe home</p>} path="/" />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function fillLogin() {
  fireEvent.change(screen.getByRole('textbox', { name: '로그인 ID' }), {
    target: { value: 'customer-01' },
  });
  fireEvent.change(screen.getByLabelText(/비밀번호/), {
    target: { value: 'secret-input' },
  });
  fireEvent.click(screen.getByRole('button', { name: '로그인' }));
}

afterEach(() => {
  clearReturnContext(null);
  window.sessionStorage.clear();
});

describe('LoginPage live Backend integration', () => {
  it('logs in through the real BackendAuthDataSource and consumes ReturnContext after success', async () => {
    const now = Date.now();
    const sessionStore = new MemoryAuthSessionStore();

    saveReturnContext(
      {
        returnTo: '/my-trips',
        intent: 'continue-navigation',
        createdAt: now,
      },
      window.sessionStorage,
      now,
    );

    server.use(
      http.post(`${baseUrl}/auth/login`, async ({ request }) => {
        expect(await request.json()).toEqual({
          loginId: 'customer-01',
          password: 'secret-input',
        });
        expect(request.headers.get('authorization')).toBeNull();

        return HttpResponse.json({
          accessToken: 'live-synthetic-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 101,
            role: 'CUSTOMER',
            name: 'Live Synthetic Customer',
          },
        });
      }),
    );

    renderLiveLogin(sessionStore);
    await screen.findByRole('button', { name: '로그인' });
    fillLogin();

    expect(await screen.findByText('My Trips destination')).toBeVisible();
    expect(sessionStore.getAccessToken()).toBe('live-synthetic-token');
    expect(window.sessionStorage.getItem(RETURN_CONTEXT_STORAGE_KEY)).toBeNull();
  });

  it('keeps ReturnContext and no session when the Backend rejects credentials', async () => {
    const now = Date.now();
    const sessionStore = new MemoryAuthSessionStore();

    saveReturnContext(
      {
        returnTo: '/my-trips',
        intent: 'continue-navigation',
        createdAt: now,
      },
      window.sessionStorage,
      now,
    );

    server.use(
      http.post(`${baseUrl}/auth/login`, () =>
        HttpResponse.json(
          {
            code: 'LOGIN_FAILED',
            message: 'Human text is not control flow.',
            fieldErrors: [],
          },
          { status: 401 },
        ),
      ),
    );

    renderLiveLogin(sessionStore);
    await screen.findByRole('button', { name: '로그인' });
    fillLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '입력한 로그인 정보를 확인해주세요.',
    );
    expect(sessionStore.getAccessToken()).toBeNull();
    expect(window.sessionStorage.getItem(RETURN_CONTEXT_STORAGE_KEY)).not.toBeNull();
  });
});
