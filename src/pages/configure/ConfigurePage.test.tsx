// @vitest-environment jsdom

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
    tourProductId: '42',
    tourScheduleId: '7',
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
  return render(
    <ReservationDraftProvider storage={storage} now={() => 10}>
      <MemoryRouter initialEntries={['/tours/42/configure']}>
        <Routes>
          <Route element={<ConfigurePage />} path={routePatterns.configure} />
          <Route element={<h1>Reservation review marker</h1>} path={routePaths.reservationReview} />
        </Routes>
      </MemoryRouter>
    </ReservationDraftProvider>,
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
      '/tours/42',
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
        tourProductId: '43',
      }),
    );

    renderConfigure(storage);

    expect(
      screen.getByRole('heading', { name: 'This route does not match your saved trip' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Resume saved trip' })).toHaveAttribute(
      'href',
      '/tours/43/configure',
    );
    expect(JSON.parse(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY) ?? '{}')).toMatchObject({
      tourProductId: '43',
    });
  });

  it('renders the desktop configurator from an existing transaction context', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

    expect(screen.getByRole('heading', { name: 'Build your trip' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Hotel' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Transport' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Meal' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Extras' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Review trip' })).toBeDisabled();
    expect(screen.getByText(/canonical option IDs and live prices are not assumed/i)).toBeVisible();
  });

  it('keeps unrelated required selections while updating Draft and summary', async () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

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

  it('enables Review only after locally knowable required selections are complete', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

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

  it('does not invent Extras interaction before its Shared Contract is approved', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(tripContextDraft()));

    renderConfigure(storage);

    const extrasHeading = screen.getByRole('heading', { name: 'Extras' });
    const extrasSection = extrasHeading.closest('section');

    expect(extrasSection).not.toBeNull();
    expect(within(extrasSection as HTMLElement).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      within(extrasSection as HTMLElement).getByText(/reserved configuration area/i),
    ).toBeVisible();
  });
});
