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
    tourScheduleId: 'schedule-7',
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

describe('ReservationReviewPage handoff guard', () => {
  it('offers a Draft-derived Configure return path without implementing Review submit', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(completeDraft()));

    renderReview(storage);

    expect(screen.getByRole('heading', { name: 'Reservation Review' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Your trip draft is preserved' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Back to configuration' })).toHaveAttribute(
      'href',
      '/tours/tour-42/configure',
    );
    expect(screen.queryByRole('button', { name: /submit|reserve|apply/i })).not.toBeInTheDocument();
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
