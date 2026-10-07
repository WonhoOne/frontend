// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { ReservationDataSourceError } from '@/features/reservation/reservation.error';
import { mockReservationSuccessFixture } from '@/features/reservation/reservationSuccessFixture';
import { ReservationDetailPage } from '@/pages/reservation-detail/ReservationDetailPage';
import { ReservationSuccessPage } from '@/pages/reservation-success/ReservationSuccessPage';

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderSuccess(
  getReservation: (reservationId: number) => Promise<typeof mockReservationSuccessFixture>,
  path = '/reservation/801/success',
  client = createClient(),
) {
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/reservation/:reservationId/success"
            element={<ReservationSuccessPage dataSource={{ getReservation }} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return client;
}

function renderDetail(
  getReservation: (reservationId: number) => Promise<typeof mockReservationSuccessFixture>,
  path = '/reservations/801',
  client = createClient(),
) {
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/reservations/:reservationId"
            element={<ReservationDetailPage dataSource={{ getReservation }} />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return client;
}

describe('Reservation Success/Detail live reads', () => {
  it('recovers Success from a cold cache using the reservation GET source', async () => {
    const getReservation = vi.fn().mockResolvedValue(mockReservationSuccessFixture);

    renderSuccess(getReservation);

    expect(await screen.findByRole('heading', { name: 'Reservation received' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
    expect(getReservation).toHaveBeenCalledTimes(1);
    expect(getReservation).toHaveBeenCalledWith(801);
  });

  it('recovers Detail directly from the reservation GET source without mutation-local data', async () => {
    const getReservation = vi.fn().mockResolvedValue(mockReservationSuccessFixture);

    renderDetail(getReservation);

    expect(await screen.findByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
    expect(screen.getByText('Reservation #801')).toBeVisible();
    expect(getReservation).toHaveBeenCalledTimes(1);
    expect(getReservation).toHaveBeenCalledWith(801);
  });

  it.each([
    ['missing reservation', '/reservations/9001'],
    ['foreign reservation', '/reservations/9002'],
  ])('shows identical hidden-404 UI for a %s', async (_caseName, path) => {
    const getReservation = vi.fn().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'not-found',
        code: 'RESERVATION_NOT_FOUND',
      }),
    );

    renderDetail(getReservation, path);

    expect(await screen.findByRole('heading', { name: 'Reservation not found' })).toBeVisible();
    expect(screen.getByText('This reservation is unavailable or cannot be shown.')).toBeVisible();
    expect(screen.queryByText('Mock 제주 허니문')).not.toBeInTheDocument();
  });

  it('rejects non-canonical route identity without issuing a Backend read', async () => {
    const getReservation = vi.fn().mockResolvedValue(mockReservationSuccessFixture);

    renderSuccess(getReservation, '/reservation/0801/success');

    expect(await screen.findByRole('heading', { name: 'Reservation not found' })).toBeVisible();
    expect(getReservation).not.toHaveBeenCalled();
  });

  it('presents authentication loss without exposing stale private reservation data', async () => {
    const getReservation = vi.fn().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'authentication-required',
        code: 'AUTHENTICATION_REQUIRED',
      }),
    );

    renderDetail(getReservation);

    expect(await screen.findByRole('heading', { name: 'Sign in to view this reservation' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Go to Login' })).toHaveAttribute('href', '/login');
    expect(screen.queryByText('Mock 제주 허니문')).not.toBeInTheDocument();
  });

  it('shares cached reservation truth between Success and Detail while a safe refresh is pending', async () => {
    const client = createClient();
    let resolveRefresh!: (value: typeof mockReservationSuccessFixture) => void;
    const getReservation = vi
      .fn()
      .mockResolvedValueOnce(mockReservationSuccessFixture)
      .mockImplementationOnce(
        () =>
          new Promise<typeof mockReservationSuccessFixture>((resolve) => {
            resolveRefresh = resolve;
          }),
      );

    const success = render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/reservation/801/success']}>
          <Routes>
            <Route
              path="/reservation/:reservationId/success"
              element={<ReservationSuccessPage dataSource={{ getReservation }} />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Reservation received' })).toBeVisible();
    success.unmount();

    renderDetail(getReservation, '/reservations/801', client);

    expect(screen.getByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
    await waitFor(() => expect(getReservation).toHaveBeenCalledTimes(2));

    resolveRefresh(mockReservationSuccessFixture);
  });
});
