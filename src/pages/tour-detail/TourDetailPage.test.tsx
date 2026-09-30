// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import {
  findTourDetailPreview,
  type TourDetailCoreState,
  tourDetailPreviewStates,
} from '@/features/tour-detail';
import { TourDetailPageView } from '@/pages/tour-detail/TourDetailPage';

afterEach(cleanup);

function renderView(
  coreState: TourDetailCoreState = tourDetailPreviewStates.loading,
  onRetry?: () => void,
) {
  return render(
    <MemoryRouter>
      <TourDetailPageView coreState={coreState} {...(onRetry !== undefined ? { onRetry } : {})} />
    </MemoryRouter>,
  );
}

describe('TourDetailPageView core states', () => {
  it('renders the editorial core for a known TourProduct identity', () => {
    const tour = findTourDetailPreview('demo-honeymoon-product-a');

    if (tour === null) {
      throw new Error('expected Honeymoon preview fixture');
    }

    renderView({ status: 'ready', tour });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Honeymoon Romance · Journey 01' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'A more considered way to travel together.',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'What this Theme brings with it.' }),
    ).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.queryByText(/schedule date|hotel name/i)).not.toBeInTheDocument();
  });

  it('keeps two TourProducts in the same Theme as distinct detail identities', () => {
    const first = findTourDetailPreview('demo-golf-product-a');
    const second = findTourDetailPreview('demo-golf-product-b');

    expect(first?.id).not.toBe(second?.id);
    expect(first?.name).toBe('Golf Challenge · Journey 01');
    expect(second?.name).toBe('Golf Challenge · Journey 02');
    expect(first?.theme).toBe('GOLF_CHALLENGE');
    expect(second?.theme).toBe('GOLF_CHALLENGE');
  });

  it('uses geometry-matched skeletons instead of a generic spinner for core loading', () => {
    renderView(tourDetailPreviewStates.loading);

    expect(screen.getByRole('heading', { level: 1, name: 'Loading tour details' })).toBeVisible();
    expect(screen.getByLabelText('Loading tour details')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('tour-detail-skeleton')).toBeVisible();
  });

  it('renders a branded not-found state with a Tours recovery path', () => {
    renderView({ status: 'not-found' });

    expect(
      screen.getByRole('heading', { level: 1, name: "This journey couldn't be found." }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Browse tours' })).toHaveAttribute('href', '/tours');
  });

  it('keeps core errors recoverable without exposing raw Backend messages', () => {
    const onRetry = vi.fn();

    renderView(tourDetailPreviewStates.networkError, onRetry);

    expect(
      screen.getByRole('heading', { level: 1, name: "We couldn't load this journey." }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps Tour content visible when the hero image fails', () => {
    renderView(tourDetailPreviewStates.imageFailure);

    fireEvent.error(screen.getByRole('img', { name: 'Golf Challenge editorial preview' }));

    expect(screen.getByText('Golf Challenge hero visual unavailable')).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();
  });
});
