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

  it('starts with no selected style and mirrors Honeymoon restrictions', () => {
    const tour = findTourDetailPreview('demo-honeymoon-product-a');

    if (tour === null) {
      throw new Error('expected Honeymoon preview fixture');
    }

    renderView({ status: 'ready', tour });

    const grand = screen.getByRole('radio', { name: /Grand/ });
    const premium = screen.getByRole('radio', { name: /Premium/ });

    expect(screen.queryByRole('radio', { name: /Classic/ })).not.toBeInTheDocument();
    expect(grand).not.toBeChecked();
    expect(premium).not.toBeChecked();
  });

  it('offers all three approved styles for Golf and updates native radio state', () => {
    const tour = findTourDetailPreview('demo-golf-product-a');

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    renderView({ status: 'ready', tour });

    const classic = screen.getByRole('radio', { name: /Classic/ });
    const grand = screen.getByRole('radio', { name: /Grand/ });
    const premium = screen.getByRole('radio', { name: /Premium/ });

    expect(classic).not.toBeChecked();
    expect(grand).not.toBeChecked();
    expect(premium).not.toBeChecked();

    fireEvent.click(grand);

    expect(classic).not.toBeChecked();
    expect(grand).toBeChecked();
    expect(premium).not.toBeChecked();
    expect(grand.closest('[data-selected="true"]')).not.toBeNull();
  });

  it('mirrors Parents and Trekking Style restrictions in the rendered UI', () => {
    const parents = findTourDetailPreview('demo-parents-product-a');
    const trekking = findTourDetailPreview('demo-trekking-product-a');

    if (parents === null || trekking === null) {
      throw new Error('expected Parents and Trekking preview fixtures');
    }

    const view = renderView({ status: 'ready', tour: parents });

    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.queryByRole('radio', { name: /Classic/ })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Grand/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Premium/ })).not.toBeChecked();

    view.rerender(
      <MemoryRouter>
        <TourDetailPageView coreState={{ status: 'ready', tour: trekking }} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /Classic/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Grand/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Premium/ })).not.toBeChecked();
  });

  it('resets local Style selection when the TourProduct identity changes', () => {
    const golf = findTourDetailPreview('demo-golf-product-a');
    const parents = findTourDetailPreview('demo-parents-product-a');

    if (golf === null || parents === null) {
      throw new Error('expected Tour Detail preview fixtures');
    }

    const view = renderView({ status: 'ready', tour: golf });

    fireEvent.click(screen.getByRole('radio', { name: /Classic/ }));
    expect(screen.getByRole('radio', { name: /Classic/ })).toBeChecked();

    view.rerender(
      <MemoryRouter>
        <TourDetailPageView coreState={{ status: 'ready', tour: parents }} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('radio', { name: /Classic/ })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Grand/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /Premium/ })).not.toBeChecked();
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
