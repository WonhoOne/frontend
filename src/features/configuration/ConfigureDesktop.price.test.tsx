// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ConfigureDesktop,
  createContractNeutralConfigureFixture,
  type PriceDisplayModel,
} from '@/features/configuration';
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

function completeDraft(): ReservationDraftV1 {
  return {
    schemaVersion: 1,
    tourProductId: 'tour-42',
    tourScheduleId: 'schedule-7',
    tourStyle: 'GRAND',
    participantCount: 2,
    configuration: {
      hotelSelectionKey: 'fixture:hotel:a',
      transportSelectionKey: 'fixture:transport:a',
      mealSelectionKey: 'fixture:meal:a',
      extraSelectionKeys: [],
    },
    updatedAt: 1,
  };
}

function renderConfigure(price: PriceDisplayModel, onRetryPrice = vi.fn()) {
  const storage = new MemoryStorage();
  storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(completeDraft()));

  render(
    <ReservationDraftProvider now={() => 10} storage={storage}>
      <ConfigureDesktop
        onRetryPrice={onRetryPrice}
        onReview={vi.fn()}
        participantRule="general"
        price={price}
        scenario={createContractNeutralConfigureFixture()}
        tourProductId="tour-42"
      />
    </ReservationDraftProvider>,
  );

  return { onRetryPrice };
}

describe('ConfigureDesktop price boundary', () => {
  it('keeps configuration and Review usable when a displayed price refresh fails', () => {
    const { onRetryPrice } = renderConfigure({
      state: 'error',
      previousTotalLabel: 'Fixture previous total',
      message: 'Could not refresh price.',
    });

    expect(screen.getByRole('radio', { name: /Fixture hotel A/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Fixture transport A/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Fixture meal A/i })).toBeChecked();

    const summary = screen.getByRole('complementary', { name: 'Current trip configuration' });

    expect(within(summary).getByText('Fixture previous total')).toBeVisible();
    expect(within(summary).getByText('Could not refresh price.')).toBeVisible();
    expect(within(summary).getByRole('button', { name: 'Review trip' })).toBeEnabled();

    fireEvent.click(within(summary).getByRole('button', { name: 'Retry price' }));

    expect(onRetryPrice).toHaveBeenCalledTimes(1);
  });

  it('does not replace a previous displayed price with zero during recalculation', () => {
    renderConfigure({
      state: 'recalculating',
      previousTotalLabel: 'Fixture previous total',
    });

    const summary = screen.getByRole('complementary', { name: 'Current trip configuration' });

    expect(within(summary).getByText('Fixture previous total')).toBeVisible();
    expect(within(summary).getByRole('status')).toHaveTextContent('Updating price');
    expect(within(summary).queryByText(/0/)).not.toBeInTheDocument();
  });

  it('uses a skeleton rather than a made-up amount when price has never loaded', () => {
    renderConfigure({
      state: 'loading',
      previousTotalLabel: null,
    });

    const summary = screen.getByRole('complementary', { name: 'Current trip configuration' });
    const loading = within(summary).getByLabelText('Price loading');

    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(loading.querySelector('[data-skeleton-variant="line"]')).not.toBeNull();
    expect(within(summary).queryByText(/0/)).not.toBeInTheDocument();
  });
});
