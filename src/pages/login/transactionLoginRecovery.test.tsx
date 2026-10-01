// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AuthProvider,
  clearReturnContext,
  saveReturnContext,
  type AuthDataSource,
  type LoginResult,
} from '@/features/auth';
import {
  ReservationDraftProvider,
  RESERVATION_DRAFT_STORAGE_KEY,
  useReservationDraft,
} from '@/features/reservation';
import { LoginPage } from '@/pages/login/LoginPage';

const NOW = 1_800_000_000_000;
const loginResult: LoginResult = {
  accessToken: 'synthetic-token',
  tokenType: 'Bearer',
  expiresIn: 60,
  user: { id: 7, role: 'CUSTOMER', name: 'Synthetic Customer' },
};

function ReviewBoundary({ onSubmit }: { onSubmit: () => void }) {
  const { draft } = useReservationDraft();

  return (
    <section>
      <h1>Reservation Review Boundary</h1>
      <output aria-label="tour product">{draft.tourProductId}</output>
      <button onClick={onSubmit} type="button">
        Confirm reservation
      </button>
    </section>
  );
}

function renderTransactionRecovery(dataSource: AuthDataSource, onSubmit: () => void) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <AuthProvider dataSource={dataSource}>
      <ReservationDraftProvider>{children}</ReservationDraftProvider>
    </AuthProvider>
  );

  return render(
    <MemoryRouter initialEntries={['/login']}>
      {wrapper({
        children: (
          <Routes>
            <Route element={<LoginPage />} path="/login" />
            <Route element={<ReviewBoundary onSubmit={onSubmit} />} path="/reservation/review" />
            <Route element={<p>Safe home</p>} path="/" />
          </Routes>
        ),
      })}
    </MemoryRouter>,
  );
}

afterEach(() => {
  clearReturnContext(null);
  window.sessionStorage.clear();
});

describe('transaction login recovery public boundary', () => {
  it('returns to Review with Draft preserved and never auto-submits after login', async () => {
    window.sessionStorage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        tourProductId: 'synthetic-tour',
        tourScheduleId: 'synthetic-schedule',
        tourStyle: 'CLASSIC',
        participantCount: 2,
        configuration: {
          hotelSelectionKey: null,
          transportSelectionKey: null,
          mealSelectionKey: null,
          extraSelectionKeys: [],
        },
        updatedAt: NOW,
      }),
    );
    expect(
      saveReturnContext(
        {
          returnTo: '/reservation/review',
          intent: 'resume-reservation-review',
          createdAt: NOW,
        },
        window.sessionStorage,
        NOW,
      ),
    ).toBe(true);

    const login = vi.fn().mockResolvedValue(loginResult);
    const reservationSubmit = vi.fn();
    const dataSource: AuthDataSource = {
      login,
      signup: vi.fn().mockRejectedValue(new Error('not used')),
    };

    renderTransactionRecovery(dataSource, reservationSubmit);

    await screen.findByRole('heading', { name: 'Login' });
    fireEvent.change(screen.getByRole('textbox', { name: '로그인 ID' }), {
      target: { value: 'synthetic-customer' },
    });
    fireEvent.change(screen.getByLabelText(/비밀번호/), {
      target: { value: 'synthetic-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(
      await screen.findByRole('heading', { name: 'Reservation Review Boundary' }),
    ).toBeVisible();
    expect(screen.getByLabelText('tour product')).toHaveTextContent('synthetic-tour');
    expect(reservationSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm reservation' }));
    expect(reservationSubmit).toHaveBeenCalledTimes(1);
  });

  it('uses safe home fallback when persisted recovery is invalid', async () => {
    window.sessionStorage.setItem(
      'mister-world:return-context:v1',
      JSON.stringify({
        schemaVersion: 1,
        returnTo: 'https://evil.example',
        intent: 'continue-navigation',
        draftSchemaVersion: 1,
        createdAt: Date.now(),
      }),
    );

    const dataSource: AuthDataSource = {
      login: vi.fn().mockResolvedValue(loginResult),
      signup: vi.fn().mockRejectedValue(new Error('not used')),
    };

    renderTransactionRecovery(dataSource, vi.fn());

    await screen.findByRole('heading', { name: 'Login' });
    fireEvent.change(screen.getByRole('textbox', { name: '로그인 ID' }), {
      target: { value: 'synthetic-customer' },
    });
    fireEvent.change(screen.getByLabelText(/비밀번호/), {
      target: { value: 'synthetic-secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('Safe home')).toBeVisible();
  });
});
