// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  EmptyState,
  LoadingState,
  OfflineBanner,
  RefreshIndicator,
  SectionError,
} from '@/app/state';
import { Button, Skeleton } from '@/shared/ui';

describe('state presentation baseline', () => {
  it('keeps loading semantics on the parent while Skeleton geometry stays presentational', () => {
    render(
      <LoadingState label="Loading tours">
        <Skeleton data-testid="loading-skeleton" variant="block" />
      </LoadingState>,
    );

    expect(screen.getByRole('region', { name: 'Loading tours' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByTestId('loading-skeleton')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps retry local to a SectionError and exposes retrying state', () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <SectionError
        onRetry={onRetry}
        retryLabel="Try again"
        retryingLabel="Trying again"
        title="Schedule unavailable"
      >
        <p>Keep the rest of the page visible.</p>
      </SectionError>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(
      <SectionError
        isRetrying
        onRetry={onRetry}
        retryLabel="Try again"
        retryingLabel="Trying again"
        title="Schedule unavailable"
      >
        <p>Keep the rest of the page visible.</p>
      </SectionError>,
    );

    expect(screen.getByRole('button', { name: 'Trying again' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Trying again' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('keeps Empty distinct from Error and lets the Feature own its action', () => {
    render(
      <EmptyState action={<Button>Browse tours</Button>} title="No saved trips">
        <p>Choose what the user can do next.</p>
      </EmptyState>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'No saved trips' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Browse tours' })).toBeVisible();
  });

  it('announces offline and refresh signals without replacing success content', () => {
    render(
      <>
        <p>Existing content</p>
        <OfflineBanner>Offline. Showing saved content.</OfflineBanner>
        <RefreshIndicator label="Refreshing schedule" state="refreshing" />
        <RefreshIndicator label="Schedule may be stale" state="stale" />
      </>,
    );

    expect(screen.getByText('Existing content')).toBeVisible();
    expect(screen.getAllByRole('status')).toHaveLength(3);
    expect(screen.getByText('Refreshing schedule').closest('[data-refresh-state]')).toHaveAttribute(
      'data-refresh-state',
      'refreshing',
    );
    expect(
      screen.getByText('Schedule may be stale').closest('[data-refresh-state]'),
    ).toHaveAttribute('data-refresh-state', 'stale');
  });
});
