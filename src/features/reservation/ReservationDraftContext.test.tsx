// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ReservationDraftProvider,
  RESERVATION_DRAFT_STORAGE_KEY,
  serializeReservationDraft,
  useReservationDraft,
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

function restoredDraft(): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: '42',
    tourScheduleId: '7',
    tourStyle: 'PREMIUM',
    participantCount: 4,
    configuration: {
      hotelSelectionKey: 'hotel-restored',
      transportSelectionKey: 'transport-restored',
      mealSelectionKey: 'meal-restored',
      extraSelectionKeys: ['extra-restored'],
    },
    updatedAt: 50,
  };
}

function DraftProbe() {
  const { draft, dispatch, hydrationStatus, persistenceStatus } = useReservationDraft();

  return (
    <div>
      <output data-testid="product">{draft.tourProductId ?? 'none'}</output>
      <output data-testid="style">{draft.tourStyle ?? 'none'}</output>
      <output data-testid="hydration">{hydrationStatus}</output>
      <output data-testid="persistence">{persistenceStatus}</output>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: 'START_DRAFT',
            tourProductId: '43',
            updatedAt: 100,
          })
        }
      >
        Start
      </button>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: 'SELECT_TOUR_STYLE',
            tourStyle: 'GRAND',
            updatedAt: 101,
          })
        }
      >
        Style
      </button>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: 'DISCARD_DRAFT',
            updatedAt: 102,
          })
        }
      >
        Discard
      </button>
    </div>
  );
}

describe('ReservationDraftProvider', () => {
  it('rehydrates a valid stored draft before children read transaction state', () => {
    const storage = new MemoryStorage();
    storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(restoredDraft()));

    render(
      <ReservationDraftProvider storage={storage} now={() => 999}>
        <DraftProbe />
      </ReservationDraftProvider>,
    );

    expect(screen.getByTestId('product')).toHaveTextContent('42');
    expect(screen.getByTestId('style')).toHaveTextContent('PREMIUM');
    expect(screen.getByTestId('hydration')).toHaveTextContent('restored');
    expect(screen.getByTestId('persistence')).toHaveTextContent('available');
  });

  it('persists reducer changes and explicit discard removes storage', async () => {
    const storage = new MemoryStorage();

    render(
      <ReservationDraftProvider storage={storage} now={() => 1}>
        <DraftProbe />
      </ReservationDraftProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Style' }));

    await waitFor(() => {
      const serialized = storage.getItem(RESERVATION_DRAFT_STORAGE_KEY);
      expect(serialized).not.toBeNull();
      expect(JSON.parse(serialized ?? '{}')).toMatchObject({
        tourProductId: '43',
        tourStyle: 'GRAND',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));

    await waitFor(() => {
      expect(storage.getItem(RESERVATION_DRAFT_STORAGE_KEY)).toBeNull();
    });
    expect(screen.getByTestId('product')).toHaveTextContent('none');
  });

  it('keeps in-memory transaction state when sessionStorage writes fail', async () => {
    const storage: ReservationDraftStorage = {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error('quota');
      },
      removeItem() {},
    };

    render(
      <ReservationDraftProvider storage={storage} now={() => 1}>
        <DraftProbe />
      </ReservationDraftProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.getByTestId('product')).toHaveTextContent('43');

    await waitFor(() => {
      expect(screen.getByTestId('persistence')).toHaveTextContent('degraded');
    });
  });
});
