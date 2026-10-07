// @vitest-environment jsdom

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ConfigureDesktop,
  createContractNeutralConfigureFixture,
  createReadyConfigureRuntimeState,
  type ConfigureRuntimeState,
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
    tourProductId: '42',
    tourScheduleId: '7',
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

function renderConfigure(runtimeState: ConfigureRuntimeState, onRetryGroup = vi.fn()) {
  const storage = new MemoryStorage();
  storage.setItem(RESERVATION_DRAFT_STORAGE_KEY, serializeReservationDraft(completeDraft()));

  render(
    <ReservationDraftProvider now={() => 10} storage={storage}>
      <ConfigureDesktop
        onRetryGroup={onRetryGroup}
        onReturnToTour={vi.fn()}
        onReview={vi.fn()}
        participantRule="general"
        runtimeState={runtimeState}
        scenario={createContractNeutralConfigureFixture()}
        tourProductId="42"
      />
    </ReservationDraftProvider>,
  );

  return { onRetryGroup };
}

describe('ConfigureDesktop transaction states', () => {
  it('keeps successful groups and summary rows during a partial group failure', () => {
    const runtimeState = createReadyConfigureRuntimeState();
    runtimeState.groups.transport = { status: 'error', isRetrying: false };

    const { onRetryGroup } = renderConfigure(runtimeState);

    expect(screen.getByRole('radio', { name: /Fixture hotel A/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Fixture meal A/i })).toBeChecked();
    expect(screen.getByRole('heading', { name: 'Transport options unavailable' })).toBeVisible();

    const summary = screen.getByRole('complementary', { name: 'Current trip configuration' });
    expect(within(summary).getByText('Fixture hotel A')).toBeVisible();
    expect(within(summary).getByText('Fixture meal A')).toBeVisible();
    expect(within(summary).getAllByText('Not selected')).not.toHaveLength(0);
    expect(within(summary).getByRole('button', { name: 'Review trip' })).toBeDisabled();

    screen.getByRole('button', { name: 'Retry Transport' }).click();
    expect(onRetryGroup).toHaveBeenCalledWith('transport');
  });

  it('keeps stale successful content usable and labels offline data without inventing policy', () => {
    const runtimeState = createReadyConfigureRuntimeState();
    runtimeState.connectivity = 'offline';
    runtimeState.groups.hotel = { status: 'stale' };
    runtimeState.groups.transport = { status: 'refreshing' };

    renderConfigure(runtimeState);

    expect(
      screen.getByText('You are offline. Option availability may be out of date.'),
    ).toBeVisible();
    expect(screen.getByText('Availability may be out of date')).toBeVisible();
    expect(screen.getByText('Updating availability')).toBeVisible();

    const summary = screen.getByRole('complementary', { name: 'Current trip configuration' });
    expect(within(summary).getByRole('button', { name: 'Review trip' })).toBeEnabled();
  });

  it('keeps an invalid selection visible in the summary and blocks Review', () => {
    const runtimeState = createReadyConfigureRuntimeState();
    runtimeState.groups.transport = { status: 'invalid' };

    renderConfigure(runtimeState);

    const summary = screen.getByRole('complementary', { name: 'Current trip configuration' });
    expect(within(summary).getByText('Fixture transport A')).toBeVisible();
    expect(within(summary).getByText('Needs another selection')).toBeVisible();
    expect(within(summary).getByRole('button', { name: 'Review trip' })).toBeDisabled();
  });
});
