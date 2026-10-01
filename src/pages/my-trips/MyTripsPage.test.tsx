// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AuthProvider,
  clearReturnContext,
  consumeReturnContext,
  type AuthDataSource,
} from '@/features/auth';
import {
  travelHistoryQueryKey,
  type TravelHistoryDataSource,
  type TravelHistoryItemModel,
} from '@/features/travel-history';
import { AuthenticatedMyTrips, MyTripsPage } from '@/pages/my-trips/MyTripsPage';

function authSource(): AuthDataSource {
  return {
    login: vi.fn().mockRejectedValue(new Error('not used')),
    signup: vi.fn().mockRejectedValue(new Error('not used')),
  };
}

function QueryWrapper({
  children,
  queryClient,
}: PropsWithChildren<{ queryClient: QueryClient }>) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

afterEach(() => {
  clearReturnContext();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('MyTripsPage', () => {
  it('protects direct access with ReturnContext before starting a private query', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryWrapper queryClient={queryClient}>
        <AuthProvider dataSource={authSource()}>
          <MemoryRouter initialEntries={['/my-trips']}>
            <Routes>
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/login" element={<p>Login destination</p>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryWrapper>,
    );

    expect(await screen.findByText('Login destination')).toBeVisible();
    expect(queryClient.getQueryState(travelHistoryQueryKey)).toBeUndefined();
    expect(consumeReturnContext()).toMatchObject({
      intent: 'continue-navigation',
      returnTo: '/my-trips',
    });
  });

  it('renders the shared history result in the backend-provided order', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const trips: readonly TravelHistoryItemModel[] = [
      {
        reservationId: 22,
        tourProduct: { id: 2, theme: 'HONEYMOON_ROMANCE', name: 'Recent Journey' },
        startDate: '2026-08-10',
        endDate: '2026-08-15',
        style: 'PREMIUM',
        price: { amount: 2200000, currency: 'KRW' },
      },
      {
        reservationId: 11,
        tourProduct: { id: 1, theme: 'GOLF_CHALLENGE', name: 'Older Journey' },
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        style: 'CLASSIC',
        price: { amount: 1400000, currency: 'KRW' },
      },
    ];
    const dataSource: TravelHistoryDataSource = {
      getTravelHistory: vi.fn().mockResolvedValue(trips),
    };

    render(
      <QueryWrapper queryClient={queryClient}>
        <MemoryRouter>
          <AuthenticatedMyTrips dataSource={dataSource} />
        </MemoryRouter>
      </QueryWrapper>,
    );

    const recent = await screen.findByRole('heading', { name: 'Recent Journey' });
    const older = screen.getByRole('heading', { name: 'Older Journey' });
    expect(recent.compareDocumentPosition(older) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Recent Journey|Older Journey/ })).not.toBeInTheDocument();
  });

  it('covers loading, empty, initial error retry, and cached refresh failure', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let rejectRequest: ((reason?: unknown) => void) | undefined;
    const pendingSource: TravelHistoryDataSource = {
      getTravelHistory: vi.fn().mockImplementation(
        () =>
          new Promise((_, reject) => {
            rejectRequest = reject;
          }),
      ),
    };

    const { unmount } = render(
      <QueryWrapper queryClient={queryClient}>
        <MemoryRouter>
          <AuthenticatedMyTrips dataSource={pendingSource} />
        </MemoryRouter>
      </QueryWrapper>,
    );

    expect(screen.getByLabelText('여행 기록 불러오는 중')).toHaveAttribute('aria-busy', 'true');
    rejectRequest?.(new Error('offline'));
    expect(await screen.findByRole('alert')).toHaveTextContent('여행 기록을 불러오지 못했습니다');
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeVisible();
    unmount();

    const emptyClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const emptySource: TravelHistoryDataSource = { getTravelHistory: vi.fn().mockResolvedValue([]) };
    const empty = render(
      <QueryWrapper queryClient={emptyClient}>
        <MemoryRouter>
          <AuthenticatedMyTrips dataSource={emptySource} />
        </MemoryRouter>
      </QueryWrapper>,
    );
    expect(await screen.findByText('아직 지난 여행이 없습니다.')).toBeVisible();
    empty.unmount();

    const cachedClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    cachedClient.setQueryData(travelHistoryQueryKey, [
      {
        reservationId: 22,
        tourProduct: { id: 2, theme: 'HONEYMOON_ROMANCE', name: 'Cached Journey' },
        startDate: '2026-08-10',
        endDate: '2026-08-15',
        style: 'PREMIUM',
        price: { amount: 2200000, currency: 'KRW' },
      },
    ] satisfies readonly TravelHistoryItemModel[]);
    const failedRefresh: TravelHistoryDataSource = {
      getTravelHistory: vi.fn().mockRejectedValue(new Error('offline')),
    };

    render(
      <QueryWrapper queryClient={cachedClient}>
        <MemoryRouter>
          <AuthenticatedMyTrips dataSource={failedRefresh} />
        </MemoryRouter>
      </QueryWrapper>,
    );

    expect(await screen.findByRole('heading', { name: 'Cached Journey' })).toBeVisible();
    expect(await screen.findByText('최신 기록을 확인하지 못했습니다. 이전 기록을 표시합니다.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(vi.mocked(failedRefresh.getTravelHistory)).toHaveBeenCalled();
  });
});
