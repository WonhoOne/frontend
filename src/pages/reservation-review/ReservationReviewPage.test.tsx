// @vitest-environment jsdom

import { fireEvent, render as renderComponent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { adaptTourProductDetailDto, adaptTourScheduleDto } from '@/features/tour-detail';
import { ContractMappingError } from '@/integrations/backend/contracts';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import {
  AuthProvider,
  clearReturnContext,
  consumeReturnContext,
  resolveReturnContextSessionStorage,
  type AuthDataSource,
  type LoginResult,
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
import { LoginPage } from '@/pages/login/LoginPage';
import { ReservationReviewPage } from '@/pages/reservation-review/ReservationReviewPage';

const reads = vi.hoisted(() => ({ getTourProduct: vi.fn(), getTourSchedules: vi.fn() }));
vi.mock('@/app/providers/tourDetailDataSources', () => ({
  tourDetailDataSource: { getTourProduct: reads.getTourProduct },
  tourScheduleDataSource: { getTourSchedules: reads.getTourSchedules },
}));

const tour = adaptTourProductDetailDto({
  id: 42,
  theme: 'GOLF_CHALLENGE',
  name: 'F2 Synthetic Golf',
  description: 'Backend product',
  availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
  stylePrices: [
    { style: 'CLASSIC', amount: 100000, currency: 'KRW' },
    { style: 'GRAND', amount: 200000, currency: 'KRW' },
    { style: 'PREMIUM', amount: 300000, currency: 'KRW' },
  ],
});
const schedules = [302, 301].map((id) =>
  adaptTourScheduleDto(
    {
      id,
      tourId: 42,
      startDate: id === 301 ? '2026-11-14' : '2026-12-01',
      endDate: id === 301 ? '2026-11-18' : '2026-12-05',
      reservable: true,
      recruitment: { unit: 'PARTICIPANT', currentCount: 0, requiredCount: 3, confirmed: false },
    },
    42,
  ),
);

function render(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderComponent(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  reads.getTourProduct.mockReset().mockResolvedValue(tour);
  reads.getTourSchedules.mockReset().mockResolvedValue(schedules);
});

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
  it.each(['product', 'schedule'] as const)(
    'waits for %s truth without fabricating labels or submitting',
    async (pendingSource) => {
      const storage = new MemoryStorage();
      const saved = serializeReservationDraft(completeDraft());
      storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, saved);
      if (pendingSource === 'product') {
        reads.getTourProduct.mockImplementation(() => new Promise(() => {}));
      } else {
        reads.getTourSchedules.mockImplementation(() => new Promise(() => {}));
      }
      renderReview(storage);
      expect(await screen.findByLabelText('Loading your selected trip')).toHaveAttribute(
        'aria-busy',
        'true',
      );
      for (const label of [
        'Selected tour',
        'Selected schedule',
        '42',
        '301',
        'F2 Synthetic Golf',
      ]) {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      }
      expect(
        screen.queryByRole('button', { name: 'Apply for reservation' }),
      ).not.toBeInTheDocument();
      expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(saved);
    },
  );

  it.each(['product', 'schedule'] as const)(
    'preserves Draft after %s read failure and recovers only on retry',
    async (failedSource) => {
      const storage = new MemoryStorage();
      const saved = serializeReservationDraft(completeDraft());
      storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, saved);
      const failure = new ContractMappingError('TourProduct', 'id', 'resource-identity-mismatch');
      if (failedSource === 'product') {
        reads.getTourProduct.mockRejectedValueOnce(failure);
      } else {
        reads.getTourSchedules.mockRejectedValueOnce(failure);
      }
      renderReview(storage);
      expect(await screen.findByText("We couldn't load your selected trip.")).toBeVisible();
      expect(
        screen.queryByRole('button', { name: 'Apply for reservation' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Selected tour')).not.toBeInTheDocument();
      expect(screen.queryByText('Selected schedule')).not.toBeInTheDocument();
      expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(saved);
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      expect(await screen.findByText('F2 Synthetic Golf')).toBeVisible();
      expect(screen.getByText('2026-11-14 – 2026-11-18')).toBeVisible();
      expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(saved);
    },
  );

  it.each(['missing-schedule', 'wrong-product'] as const)(
    'does not substitute another identity on %s',
    async (mismatch) => {
      const storage = new MemoryStorage();
      const saved = serializeReservationDraft(completeDraft());
      storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, saved);
      if (mismatch === 'missing-schedule') {
        reads.getTourSchedules.mockResolvedValue([schedules[0]!]);
      } else {
        reads.getTourProduct.mockResolvedValue({ ...tour, id: '43' });
      }
      renderReview(storage);
      expect(await screen.findByText("We couldn't load your selected trip.")).toBeVisible();
      expect(screen.queryByText('2026-12-01 – 2026-12-05')).not.toBeInTheDocument();
      expect(screen.queryByText('F2 Synthetic Golf')).not.toBeInTheDocument();
      expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(saved);
    },
  );

  it('renders a read-only Draft review with explicit change paths', async () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(completeDraft()));

    renderReview(storage);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Review your trip' }),
    ).toBeVisible();
    expect(screen.getByText('F2 Synthetic Golf')).toBeVisible();
    expect(screen.getByText('2026-11-14 – 2026-11-18')).toBeVisible();
    expect(screen.queryByText('2026-12-01 – 2026-12-05')).not.toBeInTheDocument();
    for (const label of ['42', '301', 'Selected tour', 'Selected schedule']) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
    expect(reads.getTourProduct).toHaveBeenCalledWith(42, expect.anything());
    expect(reads.getTourSchedules).toHaveBeenCalledWith(42, expect.anything());
    expect(screen.getByText('Grand')).toBeVisible();
    expect(screen.getByText('2 participants')).toBeVisible();
    expect(screen.getByText('4-star hotel')).toBeVisible();
    expect(screen.getByText('Premium van (10)')).toBeVisible();
    expect(screen.getByText('Local restaurant')).toBeVisible();
    expect(screen.getByText('None')).toBeVisible();
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
            <Route
              path="/reservation/:reservationId/success"
              element={<p>Success destination</p>}
            />
          </Routes>
        </MemoryRouter>
      </ReservationDraftProvider>,
    );

    const submit = await screen.findByRole('button', { name: 'Apply for reservation' });
    expect(createReservation).not.toHaveBeenCalled();
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

    fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

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
  it('does not redirect 403 to Login and blocks repeated submit while preserving the Draft', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    const createReservation = vi.fn().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'forbidden',
        code: 'FORBIDDEN',
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

    fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

    expect(await screen.findByText('This account cannot submit this reservation.')).toBeVisible();
    expect(screen.queryByText('Login destination')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Correct before resubmitting' })).toBeDisabled();
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));
    expect(consumeReturnContext(resolveReturnContextSessionStorage())).toBeNull();
    expect(createReservation).toHaveBeenCalledTimes(1);
  });

  it('refetches public truth on 409, preserves the Draft, and requires manual correction', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    const createReservation = vi.fn().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'conflict',
        code: 'SCHEDULE_NOT_RESERVABLE',
        fieldErrors: [{ field: 'scheduleId', code: 'INVALID_VALUE' }],
      }),
    );
    const refreshConflictTruth = vi.fn().mockResolvedValue(true);
    const dataSource: ReservationDataSource = {
      createReservation,
      getReservation: vi.fn().mockRejectedValue(new Error('not used')),
    };

    render(
      <ReservationDraftProvider storage={storage} now={() => 10}>
        <MemoryRouter initialEntries={['/reservation/review']}>
          <ReservationReviewPage
            dataSource={dataSource}
            refreshConflictTruth={refreshConflictTruth}
          />
        </MemoryRouter>
      </ReservationDraftProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

    expect(await screen.findByText('The selected schedule is no longer reservable.')).toBeVisible();
    await waitFor(() => expect(refreshConflictTruth).toHaveBeenCalledWith('42'));
    expect(screen.getByText('Latest product and schedule information refreshed.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Choose another schedule' })).toHaveAttribute(
      'href',
      '/tours/42',
    );
    expect(screen.getByRole('button', { name: 'Correct before resubmitting' })).toBeDisabled();
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));
    expect(createReservation).toHaveBeenCalledTimes(1);
  });

  it('maps 422 field errors to correction targets without parsing human messages', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    const error = new ReservationDataSourceError({
      kind: 'validation',
      code: 'VALIDATION_FAILED',
      fieldErrors: [
        { field: 'participantCount', code: 'OUT_OF_RANGE' },
        { field: 'configuration.transportOption', code: 'CAPACITY_EXCEEDED' },
      ],
    });
    error.message = 'synthetic human message that must not control recovery';
    const createReservation = vi.fn().mockRejectedValue(error);
    const refreshConflictTruth = vi.fn().mockResolvedValue(true);
    const dataSource: ReservationDataSource = {
      createReservation,
      getReservation: vi.fn().mockRejectedValue(new Error('not used')),
    };

    render(
      <ReservationDraftProvider storage={storage} now={() => 10}>
        <MemoryRouter initialEntries={['/reservation/review']}>
          <ReservationReviewPage
            dataSource={dataSource}
            refreshConflictTruth={refreshConflictTruth}
          />
        </MemoryRouter>
      </ReservationDraftProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

    expect(await screen.findByText('Some reservation details need correction.')).toBeVisible();
    expect(screen.getByText('Traveller count needs attention.')).toHaveAttribute(
      'data-error-code',
      'OUT_OF_RANGE',
    );
    expect(screen.getByText('Transport needs attention.')).toHaveAttribute(
      'data-error-code',
      'CAPACITY_EXCEEDED',
    );
    expect(screen.queryByText(/synthetic human message/)).not.toBeInTheDocument();
    expect(refreshConflictTruth).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Correct configuration' })).toHaveAttribute(
      'href',
      '/tours/42/configure',
    );
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));
  });

  it('blocks blind retry when create outcome is ambiguous', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    const createReservation = vi.fn().mockRejectedValue(
      new ReservationDataSourceError({
        kind: 'network',
        requestMayHaveReachedServer: true,
      }),
    );
    const dataSource: ReservationDataSource = {
      createReservation,
      getReservation: vi.fn().mockRejectedValue(new Error('not used')),
    };

    render(
      <ReservationDraftProvider storage={storage} now={() => 10}>
        <MemoryRouter initialEntries={['/reservation/review']}>
          <ReservationReviewPage dataSource={dataSource} />
        </MemoryRouter>
      </ReservationDraftProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

    expect(await screen.findByText('Reservation result is uncertain.')).toBeVisible();
    const locked = screen.getByRole('button', { name: 'Submission locked' });
    expect(locked).toBeDisabled();
    fireEvent.click(locked);
    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));
  });

  it.each([
    new ReservationDataSourceError({ kind: 'server', code: 'INTERNAL_ERROR' }),
    new ReservationDataSourceError({
      kind: 'network',
      requestMayHaveReachedServer: false,
    }),
  ])(
    'keeps Draft and allows only a user-triggered retry after a known failure',
    async (failure) => {
      const storage = new MemoryStorage();
      const draft = completeDraft();
      storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
      const createReservation = vi
        .fn()
        .mockRejectedValueOnce(failure)
        .mockResolvedValueOnce({ id: 903 });
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
              <Route
                path="/reservation/:reservationId/success"
                element={<p>Success after manual retry</p>}
              />
            </Routes>
          </MemoryRouter>
        </ReservationDraftProvider>,
      );

      fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

      await waitFor(() => expect(createReservation).toHaveBeenCalledTimes(1));
      expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));
      const retry = screen.getByRole('button', { name: 'Apply for reservation' });
      expect(retry).toBeEnabled();

      fireEvent.click(retry);

      expect(await screen.findByText('Success after manual retry')).toBeVisible();
      expect(createReservation).toHaveBeenCalledTimes(2);
    },
  );

  it('does not send an offline-before-submit request and keeps the Draft for manual reconnect retry', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));
    const createReservation = vi.fn();
    const dataSource: ReservationDataSource = {
      createReservation,
      getReservation: vi.fn().mockRejectedValue(new Error('not used')),
    };
    const onlineDescriptor = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    try {
      render(
        <ReservationDraftProvider storage={storage} now={() => 10}>
          <MemoryRouter initialEntries={['/reservation/review']}>
            <ReservationReviewPage dataSource={dataSource} />
          </MemoryRouter>
        </ReservationDraftProvider>,
      );

      fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

      expect(
        await screen.findByText(/reservation was not sent because the network is unavailable/i),
      ).toBeVisible();
      expect(createReservation).not.toHaveBeenCalled();
      expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));
      expect(screen.getByRole('button', { name: 'Apply for reservation' })).toBeEnabled();
    } finally {
      if (onlineDescriptor === undefined) {
        Reflect.deleteProperty(navigator, 'onLine');
      } else {
        Object.defineProperty(navigator, 'onLine', onlineDescriptor);
      }
    }
  });

  it('returns from 401 Login recovery without auto-submit and requires a fresh manual submit', async () => {
    const storage = new MemoryStorage();
    const draft = completeDraft();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(draft));

    const authInterruption = new ReservationDataSourceError({
      kind: 'authentication-required',
      code: 'ACCESS_TOKEN_EXPIRED',
    });
    const createReservation = vi
      .fn()
      .mockRejectedValueOnce(authInterruption)
      .mockResolvedValueOnce({ id: 904 });
    const reservationSource: ReservationDataSource = {
      createReservation,
      getReservation: vi.fn().mockRejectedValue(new Error('not used')),
    };
    const loginResult: LoginResult = {
      accessToken: 'synthetic-token',
      tokenType: 'Bearer',
      expiresIn: 60,
      user: { id: 7, role: 'CUSTOMER', name: 'Synthetic Customer' },
    };
    const authSource: AuthDataSource = {
      login: vi.fn().mockResolvedValue(loginResult),
      signup: vi.fn().mockRejectedValue(new Error('not used')),
    };

    render(
      <AuthProvider dataSource={authSource}>
        <ReservationDraftProvider storage={storage} now={() => 10}>
          <MemoryRouter initialEntries={['/reservation/review']}>
            <Routes>
              <Route
                path="/reservation/review"
                element={<ReservationReviewPage dataSource={reservationSource} />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/reservation/:reservationId/success"
                element={<p>Recovered success</p>}
              />
            </Routes>
          </MemoryRouter>
        </ReservationDraftProvider>
      </AuthProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

    const loginId = await screen.findByRole('textbox', { name: '로그인 ID' });
    fireEvent.change(loginId, { target: { value: 'synthetic-customer' } });
    fireEvent.change(screen.getByLabelText(/비밀번호/), {
      target: { value: 'synthetic-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('heading', { name: 'Review your trip' })).toBeVisible();
    expect(screen.getByText('F2 Synthetic Golf')).toBeVisible();
    expect(screen.getByText('2026-11-14 – 2026-11-18')).toBeVisible();
    expect(createReservation).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBe(serializeReservationDraft(draft));

    fireEvent.click(await screen.findByRole('button', { name: 'Apply for reservation' }));

    expect(await screen.findByText('Recovered success')).toBeVisible();
    expect(createReservation).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull());
  });
});
