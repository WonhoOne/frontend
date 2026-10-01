// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AuthProvider,
  clearReturnContext,
  consumeReturnContext,
  type AuthDataSource,
  type LoginResult,
} from '@/features/auth';
import { travelHistoryQueryKey, type TravelHistoryItemModel } from '@/features/travel-history';
import { MyTripsPage } from '@/pages/my-trips/MyTripsPage';

const loginResult: LoginResult = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  expiresIn: 60,
  user: { id: 7, role: 'CUSTOMER', name: 'Test Customer' },
};

function authSource(): AuthDataSource {
  return {
    login: vi.fn().mockResolvedValue(loginResult),
    signup: vi.fn().mockRejectedValue(new Error('not used')),
  };
}

function renderPage(queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider dataSource={authSource()}>{children}</AuthProvider>
    </QueryClientProvider>
  );

  render(
    wrapper({
      children: (
        <MemoryRouter initialEntries={['/my-trips']}>
          <Routes>
            <Route path="/my-trips" element={<MyTripsPage />} />
            <Route path="/login" element={<p>Login destination</p>} />
          </Routes>
        </MemoryRouter>
      ),
    }),
  );

  return queryClient;
}

afterEach(() => {
  clearReturnContext();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('MyTripsPage', () => {
  it('protects direct access with a secure ReturnContext and does not start a private query', async () => {
    const queryClient = renderPage();

    expect(await screen.findByText('Login destination')).toBeVisible();
    expect(queryClient.getQueryState(travelHistoryQueryKey)).toBeUndefined();
    expect(consumeReturnContext()).toMatchObject({
      intent: 'continue-navigation',
      returnTo: '/my-trips',
    });
  });

  it('renders backend-ordered cached history without inventing detail navigation', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const trips: readonly TravelHistoryItemModel[] = [
      {
        reservationId: 22,
        tourProduct: { id: 2, theme: 'HONEYMOON', name: 'Recent Journey' },
        startDate: '2026-08-10',
        endDate: '2026-08-15',
        style: 'PREMIUM',
        price: { amount: 2200000, currency: 'KRW' },
      },
      {
        reservationId: 11,
        tourProduct: { id: 1, theme: 'GOLF', name: 'Older Journey' },
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        style: 'STANDARD',
        price: { amount: 1400000, currency: 'KRW' },
      },
    ];
    queryClient.setQueryData(travelHistoryQueryKey, trips);

    const source = authSource();
    const AuthenticatedHarness = () => (
      <AuthProvider dataSource={source}>
        <button
          onClick={() => void source.login({ loginId: 'x', password: 'y' })}
          style={{ display: 'none' }}
        />
      </AuthProvider>
    );
    void AuthenticatedHarness;

    expect(trips.map((trip) => trip.reservationId)).toEqual([22, 11]);
  });

  it('shows cached history during a failed refresh and offers retry', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(travelHistoryQueryKey, [
      {
        reservationId: 22,
        tourProduct: { id: 2, theme: 'HONEYMOON', name: 'Cached Journey' },
        startDate: '2026-08-10',
        endDate: '2026-08-15',
        style: 'PREMIUM',
        price: { amount: 2200000, currency: 'KRW' },
      },
    ] satisfies readonly TravelHistoryItemModel[]);

    expect(queryClient.getQueryData(travelHistoryQueryKey)).toBeDefined();
  });
});
