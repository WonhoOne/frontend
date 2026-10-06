// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routePaths, routePatterns } from '@/app/router/paths';
import { ConfigurePage } from '@/pages/configure/ConfigurePage';
import {
  ReservationDraftProvider,
  RESERVATION_DRAFT_STORAGE_KEY,
  serializeReservationDraft,
  type ReservationDraftStorage,
  type ReservationDraftV1,
} from '@/features/reservation';

class MemoryStorage implements ReservationDraftStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

function tripContextDraft(): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: '103',
    tourScheduleId: '1301',
    tourStyle: 'GRAND',
    participantCount: null,
    configuration: {
      hotelSelectionKey: null,
      transportSelectionKey: null,
      mealSelectionKey: null,
      extraSelectionKeys: [],
    },
    updatedAt: 1,
  };
}

function renderConfigure(storage: MemoryStorage) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ReservationDraftProvider storage={storage} now={() => 10}>
        <MemoryRouter initialEntries={['/tours/103/configure']}>
          <Routes>
            <Route element={<ConfigurePage />} path={routePatterns.configure} />
            <Route
              element={<h1>Reservation review marker</h1>}
              path={routePaths.reservationReview}
            />
          </Routes>
        </MemoryRouter>
      </ReservationDraftProvider>
    </QueryClientProvider>,
  );
}

describe('ConfigurePage desktop transaction', () => {
  it('shows recovery instead of inventing missing Style or Schedule context', () => {
    const storage = new MemoryStorage();

    renderConfigure(storage);

    expect(
      screen.getByRole('heading', { name: 'Choose a style and schedule first' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Back to tour details' })).toHaveAttribute(
      'href',
      '/tours/103',
    );
    expect(screen.queryByRole('button', { name: 'Review trip' })).not.toBeInTheDocument();
  });

  it('distinguishes corrupt storage from an ordinary missing transaction', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, '{not-json');

    renderConfigure(storage);

    expect(screen.getByRole('heading', { name: 'Saved trip could not be restored' })).toBeVisible();
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('preserves a route-mismatched Draft and offers its explicit resume path', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      serializeReservationDraft({
        ...tripContextDraft(),
        tourProductId: '104',
      }),
    );

    renderConfigure(storage);

    expect(
      screen.getByRole('heading', { name: 'This route does not match your saved trip' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Resume saved trip' })).toHaveAttribute(
      'href',
      '/tours/104/configure',
    );
    expect(JSON.parse(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY) ?? '{}')).toMatchObject({
      tourProductId: '104',
    });
  });

  it('renders the desktop configurator from an existing transaction context', async () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

    expect(await screen.findByRole('heading', { name: 'Build your trip' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Hotel' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Transport' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Meal' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Extras' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Review trip' })).toBeDisabled();
    expect(screen.getByText(/current Style price comes from TourProduct/i)).toBeVisible();
    expect(screen.getByText(/₩1,800,000 per participant/i)).toBeVisible();
  });

  it('keeps unrelated required selections while updating Draft and summary', async () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

    await screen.findByRole('heading', { name: 'Build your trip' });
    fireEvent.change(screen.getByRole('spinbutton', { name: /participants/i }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /Fixture hotel A/i }));
    fireEvent.click(screen.getByRole('radio', { name: /Fixture transport B/i }));
    fireEvent.click(screen.getByRole('radio', { name: /Fixture meal A/i }));

    expect(screen.getByRole('radio', { name: /Fixture hotel A/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Fixture transport B/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Fixture meal A/i })).toBeChecked();

    const summary = screen.getByRole('complementary', {
      name: 'Current trip configuration',
    });
    expect(within(summary).getByText('2 participants')).toBeVisible();
    expect(within(summary).getByText('Fixture hotel A')).toBeVisible();
    expect(within(summary).getByText('Fixture transport B')).toBeVisible();
    expect(within(summary).getByText('Fixture meal A')).toBeVisible();

    await waitFor(() => {
      const serialized = storage.getItem(RESERVATION_DRAFT_STORAGE_KEY);
      expect(JSON.parse(serialized ?? '{}')).toMatchObject({
        participantCount: 2,
        configuration: {
          hotelSelectionKey: 'fixture:hotel:a',
          transportSelectionKey: 'fixture:transport:b',
          mealSelectionKey: 'fixture:meal:a',
        },
      });
    });
  });

  it('enables Review only after locally knowable required selections are complete', async () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

    await screen.findByRole('heading', { name: 'Build your trip' });
    const reviewButton = screen.getByRole('button', { name: 'Review trip' });

    fireEvent.change(screen.getByRole('spinbutton', { name: /participants/i }), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByRole('radio', { name: /Fixture hotel A/i }));
    fireEvent.click(screen.getByRole('radio', { name: /Fixture transport A/i }));

    expect(reviewButton).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /Fixture meal B/i }));

    expect(reviewButton).toBeEnabled();

    fireEvent.click(reviewButton);

    expect(screen.getByRole('heading', { name: 'Reservation review marker' })).toBeVisible();
  });

  it('does not invent Extras interaction before its Shared Contract is approved', async () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

    await screen.findByRole('heading', { name: 'Build your trip' });
    const extrasHeading = screen.getByRole('heading', { name: 'Extras' });
    const extrasSection = extrasHeading.closest('section');

    expect(extrasSection).not.toBeNull();
    expect(within(extrasSection as HTMLElement).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      within(extrasSection as HTMLElement).getByText(/reserved configuration area/i),
    ).toBeVisible();
  });
});
