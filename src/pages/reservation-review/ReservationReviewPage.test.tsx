// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearReturnContext,
  consumeReturnContext,
  resolveReturnContextSessionStorage,
} from '@/features/auth';

import {
  ReservationDraftProvider,
  RESERVATION_DRAFT_STORAGE_KEY,
  ReservationDataSourceError,
  serializeReservationDraft,
  type ReservationDataSource,
  type ReservationDraftStorage,
  type ReservationDraftV1,
  type ReservationModel,
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
    tourProductId: '42',
    tourScheduleId: '301',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'HOTEL_4_STAR',
      transportSelectionKey: 'PREMIUM_VAN_10',
      mealSelectionKey: 'LOCAL_RESTAURANT',
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

afterEach(() => {
  clearReturnContext();
  window.sessionStorage.clear();
});

describe('ReservationReviewPage composition', () => {
  it('renders a read-only Draft review with explicit change paths', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(completeDraft()));

    renderReview(storage);

    expect(screen.getByRole('heading', { level: 1, name: 'Review your trip' })).toBeVisible();
    expect(screen.getByText('Grand')).toBeVisible();
    expect(screen.getByText('2 participants')).toBeVisible();
    expect(screen.getByText('4-star hotel')).toBeVisible();
    expect(screen.getByText('Premium van (10)')).toBeVisible();
    expect(screen.getByText('Local restaurant')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Change configuration' })).toHaveAttribute(
      'href',
      '/tours/42/configure',
    );
    expect(screen.getByRole('link', { name: 'Change style or schedule' })).toHaveAttribute(
      'href',
      '/tours/42',
    );
    expect(
      screen.getByText(/Final price and any loyalty discount are confirmed by the server/),
    ).toBeVisible();
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
      '/tours/42/configure',
    );
  });

  it('allows one canonical live create attempt during rapid repeated submit and clears Draft only after confirmed success', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));

    let resolveCreate!: (reservation: ReservationModel) => void;
    const createReservation = vi.fn(
      () =>
        new Promise<ReservationModel>((resolve) => {
          resolveCreate = resolve;
        }),
    );
    const dataSource: ReservationDataSource = {
      createReservation,
      getReservation: vi.fn().mockRejectedValue(new Error('not used')),
    };

    render(
      <ReservationDraftProvider storage={storage} now={() => 10}>
        <MemoryRouter initialEntries={['/reservation/review']}>
          <Routes>
            <Route
              path="/reservation/review"
              element={<ReservationReviewPage dataSource={dataSource} />}
            />
            <Route path="/reservation/:reservationId/success" element={<p>Success destination</p>} />
          </Routes>
        </MemoryRouter>
      </ReservationDraftProvider>,
    );

    const submit = screen.getByRole('button', { name: 'Apply for reservation' });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(createReservation).toHaveBeenCalledWith({
      scheduleId: 301,
      participantCount: 2,
      configuration: {
        style: 'GRAND',
        hotelOption: 'HOTEL_4_STAR',
        transportOption: 'PREMIUM_VAN_10',
        mealOption: 'LOCAL_RESTAURANT',
        extraOptions: [],
      },
    });
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));

    resolveCreate({ id: 902 } as ReservationModel);

    expect(await screen.findByText('Success destination')).toBeVisible();
    await waitFor(() => expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull());
    expect(createReservation).toHaveBeenCalledTimes(1);
  });

  it('connects the public 401 seam to Login without clearing or resubmitting the Draft', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    const createReservation = vi.fn().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'authentication-required',
        code: 'AUTHENTICATION_REQUIRED',
      }),
    );
    const dataSource: ReservationDataSource = {
      createReservation,
      getReservation: vi.fn().mockRejectedValue(new Error('not used')),
    };

    render(
      <ReservationDraftProvider storage={storage} now={() => 10}>
        <MemoryRouter initialEntries={['/reservation/review']}>
          <Routes>
            <Route
              path="/reservation/review"
              element={<ReservationReviewPage dataSource={dataSource} />}
            />
            <Route path="/login" element={<p>Login destination</p>} />
          </Routes>
        </MemoryRouter>
      </ReservationDraftProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Apply for reservation' }));

    expect(await screen.findByText('Login destination')).toBeVisible();
    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));

    const context = consumeReturnContext(resolveReturnContextSessionStorage());
    expect(context).toMatchObject({
      intent: 'resume-reservation-review',
      returnTo: '/reservation/review',
    });

    await waitFor(() => expect(createReservation).toHaveBeenCalledTimes(1));
  });
});
