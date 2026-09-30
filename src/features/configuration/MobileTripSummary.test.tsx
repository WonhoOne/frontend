// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MobileTripSummary } from '@/features/configuration/MobileTripSummary';
import type { ConfigureReadiness, TripSummaryModel } from '@/features/configuration';

function summary(): TripSummaryModel {
  return {
    themeLabel: 'Fixture theme',
    styleLabel: 'Grand',
    scheduleLabel: 'Fixture schedule',
    participantLabel: '2 participants',
    selections: {
      hotelLabel: 'Fixture hotel A',
      transportLabel: 'Fixture transport B',
      mealLabel: null,
      extraLabels: [],
    },
    invalidSelections: [],
    price: {
      state: 'unavailable',
      message: 'Price is not available in the contract-neutral fixture.',
    },
  };
}

describe('MobileTripSummary', () => {
  it('presents compact style, selection count, and contract-safe price state', () => {
    const readiness: ConfigureReadiness = {
      isReady: false,
      issues: ['meal'],
    };

    render(<MobileTripSummary onReview={vi.fn()} readiness={readiness} summary={summary()} />);

    expect(screen.getByText('Grand · 2 selections')).toBeVisible();
    expect(screen.getByText('Price unavailable')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Review' })).toBeDisabled();
  });

  it('opens an accessible summary sheet and returns focus after Escape', async () => {
    const user = userEvent.setup();
    const readiness: ConfigureReadiness = {
      isReady: false,
      issues: ['meal'],
    };

    render(<MobileTripSummary onReview={vi.fn()} readiness={readiness} summary={summary()} />);

    const trigger = screen.getByRole('button', { name: 'Open trip summary' });
    await user.click(trigger);

    const sheet = screen.getByRole('dialog', { name: 'Trip summary' });

    expect(sheet).toBeVisible();
    expect(screen.getByText('Fixture theme')).toBeVisible();
    expect(screen.getByText('2 participants')).toBeVisible();
    expect(screen.getByText('Fixture hotel A')).toBeVisible();
    expect(screen.getByText('Fixture transport B')).toBeVisible();
    expect(
      screen.getByText('Price is not available in the contract-neutral fixture.'),
    ).toBeVisible();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Trip summary' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('uses the same readiness gate for the persistent Review action', async () => {
    const user = userEvent.setup();
    const onReview = vi.fn();
    const readiness: ConfigureReadiness = {
      isReady: true,
      issues: [],
    };

    render(<MobileTripSummary onReview={onReview} readiness={readiness} summary={summary()} />);

    await user.click(screen.getByRole('button', { name: 'Review' }));

    expect(onReview).toHaveBeenCalledTimes(1);
  });
});
