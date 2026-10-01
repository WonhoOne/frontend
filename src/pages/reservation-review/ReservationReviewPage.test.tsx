// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import {
  ReservationDraftProvider,
  RESERVATION_DRAFT_STORAGE_KEY,
  serializeReservationDraft,
  type ReservationDraftStorage,
  type ReservationDraftV1,
} from '@/features/reservation';
import { ReservationReviewPage } from '@/pages/reservation-review/ReservationReviewPage';

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

function completeDraft(): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: 'tour-42',
    tourScheduleId: 'fixture:schedule:a',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'fixture:hotel:a',
      transportSelectionKey: 'fixture:transport:b',
      mealSelectionKey: 'fixture:meal:a',
      extraSelectionKeys: [],
    },
    updatedAt: 1,
  };
}

function renderReview(storage: MemoryStorage) {
  return render(
    <ReservationDraftProvider storage={storage} now={() => 10}>
      <MemoryRouter initialEntries={['/reservation/review']}>
        <ReservationReviewPage />
      </MemoryRouter>
    </ReservationDraftProvider>,
  );
}

describe('ReservationReviewPage composition', () => {
  it('renders a read-only Draft review with explicit change paths', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(completeDraft()));

    renderReview(storage);

    expect(screen.getByRole('heading', { level: 1, name: 'Review your trip' })).toBeVisible();
    expect(screen.getByText('Grand')).toBeVisible();
    expect(screen.getByText('2 participants')).toBeVisible();
    expect(screen.getByText('Fixture hotel A')).toBeVisible();
    expect(screen.getByText('Fixture transport B')).toBeVisible();
    expect(screen.getByText('Fixture meal A')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Change configuration' })).toHaveAttribute('href', '/tours/tour-42/configure');
    expect(screen.getByRole('link', { name: 'Change style or schedule' })).toHaveAttribute('href', '/tours/tour-42');
    expect(screen.getByText(/Final price and any loyalty discount are confirmed by the server/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply for reservation' })).toBeEnabled();
  });

  it('recovers safely from a direct Review URL without Draft', () => {
    renderReview(new MemoryStorage());

    expect(screen.getByRole('heading', { name: 'No trip to review' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Browse tours' })).toHaveAttribute('href', '/tours');
  });

  it('distinguishes corrupt storage from an ordinary missing Draft and clears it', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, '{not-json');

    renderReview(storage);

    expect(screen.getByRole('heading', { name: 'Saved trip could not be restored' })).toBeVisible();
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('sends an incomplete transaction back to its Configure route', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      serializeReservationDraft({
        ...completeDraft(),
        configuration: {
          ...completeDraft().configuration,
          mealSelectionKey: null,
        },
      }),
    );

    renderReview(storage);

    expect(screen.getByRole('heading', { name: 'Finish configuring your trip' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Back to configuration' })).toHaveAttribute(
      'href',
      '/tours/tour-42/configure',
    );
  });
});
