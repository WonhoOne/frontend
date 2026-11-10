// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConfigureDesktop, createSharedContractConfigureScenario } from '@/features/configuration';
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

function draft(participantCount: number, transportSelectionKey: string): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: '42',
    tourScheduleId: '7',
    tourStyle: 'GRAND',
    participantCount,
    configuration: {
      hotelSelectionKey: 'HOTEL_4_STAR',
      transportSelectionKey,
      mealSelectionKey: 'LOCAL_RESTAURANT',
      extraSelectionKeys: [],
    },
    updatedAt: 1,
  };
}

function renderConfigure(initial: ReservationDraftV1) {
  const storage = new MemoryStorage();
  storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(initial));
  const onReview = vi.fn();

  render(
    <ReservationDraftProvider now={() => 10} storage={storage}>
      <ConfigureDesktop
        onReview={onReview}
        participantRule="general"
        scenario={createSharedContractConfigureScenario()}
        tourProductId="42"
      />
    </ReservationDraftProvider>,
  );

  return { onReview };
}

const reviewButton = () => screen.getByRole('button', { name: 'Review trip' });
const capacityAlert = () => screen.queryByText(/seats up to 2 travellers, but 4 are traveling/);

describe('ConfigureDesktop transport capacity (BR-20, frontend#66)', () => {
  it('blocks Review when the van is swapped for the 2-seat car with 4 travellers', () => {
    const { onReview } = renderConfigure(draft(4, 'PREMIUM_VAN_10'));
    expect(reviewButton()).toBeEnabled();

    fireEvent.click(screen.getByRole('radio', { name: /Private luxury car \(2\)/ }));

    expect(reviewButton()).toBeDisabled();
    expect(capacityAlert()).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Choose another transport');
    expect(screen.getByText(/Too many travellers for the selected Transport/)).toBeVisible();
    fireEvent.click(reviewButton());
    expect(onReview).not.toHaveBeenCalled();
  });

  it('blocks Review when travellers are raised above the 2-seat car capacity', () => {
    renderConfigure(draft(2, 'PRIVATE_LUXURY_CAR_2'));
    expect(reviewButton()).toBeEnabled();
    expect(capacityAlert()).toBeNull();

    fireEvent.change(screen.getByLabelText(/Participants/), { target: { value: '4' } });

    expect(reviewButton()).toBeDisabled();
    expect(capacityAlert()).toBeVisible();
  });

  it('keeps both transports selectable and restores Review once the user fixes it', () => {
    const { onReview } = renderConfigure(draft(4, 'PRIVATE_LUXURY_CAR_2'));
    expect(reviewButton()).toBeDisabled();

    // 자동 변경 없음: 선택은 사용자가 고른 그대로 남아 있다.
    expect(screen.getByRole('radio', { name: /Private luxury car \(2\)/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Premium van \(10\)/ }));

    expect(capacityAlert()).toBeNull();
    expect(reviewButton()).toBeEnabled();
    fireEvent.click(reviewButton());
    expect(onReview).toHaveBeenCalledTimes(1);
  });
});
