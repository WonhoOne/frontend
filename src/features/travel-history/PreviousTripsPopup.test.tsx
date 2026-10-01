// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PreviousTripsPopup,
  type TravelHistoryDataSource,
  type TravelHistoryItemModel,
} from '@/features/travel-history';

const history: readonly TravelHistoryItemModel[] = [
  {
    reservationId: 22,
    tourProduct: { id: 4, theme: 'OUTDOOR_TREKKING', name: 'Synthetic Trekking' },
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    style: 'GRAND',
    price: { amount: 1200000, currency: 'KRW' },
  },
];

function installMatchMedia(desktop: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: desktop,
      media: '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

function renderPopup(source: TravelHistoryDataSource, desktop = true) {
  installMatchMedia(desktop);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onOpenChange = vi.fn();

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={<PreviousTripsPopup
              dataSource={source}
              onExplore={() => undefined}
              onOpenChange={onOpenChange}
              onViewAll={() => undefined}
              open
            />}
          />
          <Route path="/my-trips" element={<p>My Trips destination</p>} />
          <Route path="/tours" element={<p>Tours destination</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return { onOpenChange };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PreviousTripsPopup', () => {
  it.each([true, false])('uses an accessible modal surface for desktop=%s', async (desktop) => {
    renderPopup({ getTravelHistory: vi.fn().mockResolvedValue(history) }, desktop);

    expect(await screen.findByRole('dialog', { name: 'Your previous trips' })).toBeVisible();
    expect(screen.getByRole('button', { name: '닫기' })).toBeVisible();
  });

  it('shows skeleton geometry while history is loading', async () => {
    renderPopup({ getTravelHistory: vi.fn().mockReturnValue(new Promise(() => undefined)) });

    expect(screen.getByLabelText('지난 여행 불러오는 중')).toHaveAttribute('aria-busy', 'true');
    expect(document.querySelectorAll('[data-skeleton-variant]').length).toBe(9);
  });

  it('renders the v0.2 history fields without inventing a row action', async () => {
    renderPopup({ getTravelHistory: vi.fn().mockResolvedValue(history) });

    expect(await screen.findByText('Synthetic Trekking')).toBeVisible();
    expect(screen.getByText('2026-08-10 – 2026-08-12')).toBeVisible();
    expect(screen.getByText('GRAND')).toBeVisible();
    expect(screen.getByText(/1,200,000/)).toBeVisible();
    expect(screen.queryByRole('link', { name: /Synthetic Trekking/ })).not.toBeInTheDocument();
  });

  it('retries an initial history failure without changing login state', async () => {
    const getTravelHistory = vi
      .fn()
      .mockRejectedValueOnce(new Error('synthetic failure'))
      .mockResolvedValueOnce(history);
    renderPopup({ getTravelHistory });

    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }));

    expect(await screen.findByText('Synthetic Trekking')).toBeVisible();
    expect(getTravelHistory).toHaveBeenCalledTimes(2);
  });

  it('offers Tours for an empty history', async () => {
    const { onOpenChange } = renderPopup({ getTravelHistory: vi.fn().mockResolvedValue([]) });

    fireEvent.click(await screen.findByRole('button', { name: '여행 둘러보기' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(await screen.findByText('Tours destination')).toBeVisible();
  });

  it('closes and navigates to My Trips from View all', async () => {
    const { onOpenChange } = renderPopup({ getTravelHistory: vi.fn().mockResolvedValue(history) });

    fireEvent.click(await screen.findByRole('button', { name: '전체 여행 보기' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(await screen.findByText('My Trips destination')).toBeVisible();
  });

  it('keeps cached history visible when a refresh fails', async () => {
    const getTravelHistory = vi
      .fn()
      .mockResolvedValueOnce(history)
      .mockRejectedValueOnce(new Error('refresh failed'));
    renderPopup({ getTravelHistory });

    expect(await screen.findByText('Synthetic Trekking')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '전체 여행 보기' }));
  });
});
