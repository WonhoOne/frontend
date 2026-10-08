// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routeBuilders } from '@/app/router/paths';
import {
  createConfigureHandoffAction,
  ReservationDraftProvider,
  RESERVATION_DRAFT_STORAGE_KEY,
  serializeReservationDraft,
  useReservationDraft,
  type ReservationDraftStorage,
  type ReservationDraftV1,
} from '@/features/reservation';
import { ConfigurePage } from '@/pages/configure/ConfigurePage';

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

function staleDifferentTourDraft(): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: '41',
    tourScheduleId: '6',
    tourStyle: 'PREMIUM',
    participantCount: 8,
    configuration: {
      hotelSelectionKey: 'HOTEL_5_STAR',
      transportSelectionKey: 'PREMIUM_VAN_10',
      mealSelectionKey: 'PREMIUM_RESTAURANT',
      extraSelectionKeys: ['CHAMPAGNE'],
    },
    updatedAt: 1,
  };
}

/**
 * Session B의 future TourDetailPage를 대신하는 contract-only caller.
 * production Session B code를 import하지 않고 public reservation action + public route만 사용한다.
 */
function PublicTourDetailHandoffProbe() {
  const navigate = useNavigate();
  const { dispatch } = useReservationDraft();

  return (
    <button
      onClick={() => {
        dispatch(
          createConfigureHandoffAction(
            {
              tourProductId: '103',
              tourStyle: 'GRAND',
              tourScheduleId: '1301',
            },
            10,
          ),
        );
        void navigate(routeBuilders.configure('103'));
      }}
      type="button"
    >
      Continue to Configure
    </button>
  );
}

describe('Tour Detail → Configure public handoff boundary', () => {
  it('starts Configure atomically through public reservation and route interfaces', async () => {
    const storage = new MemoryStorage();
    storage.setItem(
      RESERVATION_DRAFT_STORAGE_KEY,
      serializeReservationDraft(staleDifferentTourDraft()),
    );

    const router = createMemoryRouter(
      [
        {
          path: '/tours/:tourId',
          element: <PublicTourDetailHandoffProbe />,
        },
        {
          path: '/tours/:tourId/configure',
          element: <ConfigurePage />,
        },
      ],
      {
        initialEntries: ['/tours/103'],
      },
    );

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={client}>
        <ReservationDraftProvider now={() => 10} storage={storage}>
          <RouterProvider router={router} />
        </ReservationDraftProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue to Configure' }));

    expect(await screen.findByRole('heading', { name: 'Build your trip' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/tours/103/configure');
    expect(
      await screen.findByText(/Golf Challenge · Grand · 2027-03-10 – 2027-03-14/),
    ).toBeVisible();
    expect(screen.getByRole('spinbutton', { name: /participants/i })).toHaveValue(null);
    expect(screen.getByRole('radio', { name: /4-star hotel/i })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Private luxury car \(2\)/i })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Local restaurant/i })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Review trip' })).toBeDisabled();

    await waitFor(() => {
      const serialized = storage.getItem(RESERVATION_DRAFT_STORAGE_KEY);
      expect(serialized).not.toBeNull();

      const restored = JSON.parse(serialized ?? '{}') as unknown;
      expect(restored).toMatchObject({
        tourProductId: '103',
        tourStyle: 'GRAND',
        tourScheduleId: '1301',
        participantCount: null,
        configuration: {
          hotelSelectionKey: null,
          transportSelectionKey: null,
          mealSelectionKey: null,
          extraSelectionKeys: [],
        },
      });
    });
  });
});
