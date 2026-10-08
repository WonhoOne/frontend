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
    fireEvent.click(screen.getByRole('radio', { name: /4-star hotel/i }));
    fireEvent.click(screen.getByRole('radio', { name: /Premium van \(10\)/i }));
    fireEvent.click(screen.getByRole('radio', { name: /Local restaurant/i }));

    expect(screen.getByRole('radio', { name: /4-star hotel/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Premium van \(10\)/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Local restaurant/i })).toBeChecked();

    const summary = screen.getByRole('complementary', {
      name: 'Current trip configuration',
    });
    expect(within(summary).getByText('2 participants')).toBeVisible();
    expect(within(summary).getByText('4-star hotel')).toBeVisible();
    expect(within(summary).getByText('Premium van (10)')).toBeVisible();
    expect(within(summary).getByText('Local restaurant')).toBeVisible();

    await waitFor(() => {
      const serialized = storage.getItem(RESERVATION_DRAFT_STORAGE_KEY);
      expect(JSON.parse(serialized ?? '{}')).toMatchObject({
        participantCount: 2,
        configuration: {
          hotelSelectionKey: 'HOTEL_4_STAR',
          transportSelectionKey: 'PREMIUM_VAN_10',
          mealSelectionKey: 'LOCAL_RESTAURANT',
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
    fireEvent.click(screen.getByRole('radio', { name: /4-star hotel/i }));
    fireEvent.click(screen.getByRole('radio', { name: /Private luxury car \(2\)/i }));

    expect(reviewButton).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /Premium restaurant/i }));

    expect(reviewButton).toBeEnabled();

    fireEvent.click(reviewButton);

    expect(screen.getByRole('heading', { name: 'Reservation review marker' })).toBeVisible();
  });

  it('renders enabled optional Shared Extras without blocking an empty selection', async () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

    await screen.findByRole('heading', { name: 'Build your trip' });
    expect(screen.getByRole('heading', { name: 'Extras' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeEnabled();

    const serialized = storage.getItem(RESERVATION_DRAFT_STORAGE_KEY);
    expect(JSON.parse(serialized ?? '{}')).toMatchObject({
      configuration: {
        extraSelectionKeys: [],
      },
    });
  });

  it('wires Extras to one Draft truth with deterministic ordering, toggles and live summary', async () => {
    const storage = new MemoryStorage();
    const draft = tripContextDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));

    renderConfigure(storage);

    await screen.findByRole('heading', { name: 'Build your trip' });
    const champagne = screen.getByRole('checkbox', { name: /Champagne/i });
    const coffee = screen.getByRole('checkbox', { name: /Coffee/i });
    const summary = screen.getByRole('complementary', { name: 'Current trip configuration' });

    async function expectSavedExtras(keys: string[]) {
      await waitFor(() => {
        expect(JSON.parse(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY) ?? '{}')).toMatchObject({
          configuration: { extraSelectionKeys: keys },
        });
      });
    }

    expect(champagne).not.toBeChecked();
    expect(coffee).not.toBeChecked();
    await expectSavedExtras([]);

    // Reverse click order still produces the canonical Shared option order.
    fireEvent.click(coffee);
    expect(coffee).toBeChecked();
    expect(champagne).not.toBeChecked();
    expect(within(summary).getByText('Coffee')).toBeVisible();
    await expectSavedExtras(['COFFEE']);

    fireEvent.click(champagne);
    expect(champagne).toBeChecked();
    expect(coffee).toBeChecked();
    expect(within(summary).getByText('Champagne, Coffee')).toBeVisible();
    await expectSavedExtras(['CHAMPAGNE', 'COFFEE']);

    fireEvent.click(champagne);
    expect(champagne).not.toBeChecked();
    expect(coffee).toBeChecked();
    expect(within(summary).getByText('Coffee')).toBeVisible();
    await expectSavedExtras(['COFFEE']);

    fireEvent.click(coffee);
    expect(champagne).not.toBeChecked();
    expect(coffee).not.toBeChecked();
    await expectSavedExtras([]);

    fireEvent.click(champagne);
    expect(champagne).toBeChecked();
    expect(coffee).not.toBeChecked();
    expect(within(summary).getByText('Champagne')).toBeVisible();
    await expectSavedExtras(['CHAMPAGNE']);

    fireEvent.click(champagne);
    expect(champagne).not.toBeChecked();
    await expectSavedExtras([]);

    // Extras never reset unrelated required choices.
    expect(draft.configuration.hotelSelectionKey).toBeNull();
    expect(screen.getByRole('radio', { name: /4-star hotel/i })).not.toBeChecked();
    expect(within(summary).getByRole('button', { name: 'Review trip' })).toBeDisabled();
  });

  it('restores selected Extras from persistence without introducing parallel component state', async () => {
    const storage = new MemoryStorage();
    const draft = tripContextDraft();
    storage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      serializeReservationDraft({
        ...draft,
        configuration: { ...draft.configuration, extraSelectionKeys: ['COFFEE'] },
      }),
    );

    const mounted = renderConfigure(storage);
    await screen.findByRole('heading', { name: 'Build your trip' });
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).not.toBeChecked();
    mounted.unmount();

    renderConfigure(storage);
    await screen.findByRole('heading', { name: 'Build your trip' });
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeChecked();

    fireEvent.click(screen.getByRole('checkbox', { name: /Coffee/i }));
    await waitFor(() => {
      expect(JSON.parse(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY) ?? '{}')).toMatchObject({
        configuration: { extraSelectionKeys: [] },
      });
    });
  });

  it('deduplicates existing selection keys on a GUI toggle instead of multiplying them', async () => {
    const storage = new MemoryStorage();
    const draft = tripContextDraft();
    storage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      serializeReservationDraft({
        ...draft,
        configuration: {
          ...draft.configuration,
          extraSelectionKeys: ['COFFEE', 'COFFEE'],
        },
      }),
    );

    renderConfigure(storage);
    await screen.findByRole('heading', { name: 'Build your trip' });
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: /Champagne/i }));

    await waitFor(() => {
      expect(JSON.parse(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY) ?? '{}')).toMatchObject({
        configuration: { extraSelectionKeys: ['CHAMPAGNE', 'COFFEE'] },
      });
    });
  });
});
