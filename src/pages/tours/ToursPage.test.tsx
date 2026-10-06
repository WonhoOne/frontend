import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import {
  MockTourDiscoveryDataSource,
  tourDiscoveryPreviewProducts,
  tourDiscoveryPreviewStates,
  tourDiscoveryQueryKey,
  type TourDiscoveryCollectionState,
  type TourTheme,
} from '@/features/tour-discovery';
import { ToursPage, ToursPageView } from '@/pages/tours/ToursPage';

function renderTours(initialEntry = '/tours') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const dataSource = new MockTourDiscoveryDataSource();
  client.setQueryData(tourDiscoveryQueryKey, tourDiscoveryPreviewProducts);

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ToursPage dataSource={dataSource} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderToursState(
  collectionState: TourDiscoveryCollectionState,
  options: {
    onRetry?: () => void;
    onRetryTheme?: (theme: TourTheme) => void;
  } = {},
) {
  return render(
    <MemoryRouter initialEntries={['/tours']}>
      <ToursPageView
        collectionState={collectionState}
        focusedTheme={null}
        {...(options.onRetry !== undefined ? { onRetry: options.onRetry } : {})}
        {...(options.onRetryTheme !== undefined ? { onRetryTheme: options.onRetryTheme } : {})}
      />
    </MemoryRouter>,
  );
}

describe('ToursPage', () => {
  it('renders one page H1 and all four Theme contexts on direct access', () => {
    renderTours();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toBeVisible();

    expect(screen.getByRole('heading', { level: 2, name: 'Honeymoon Romance' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Parents Healing' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Golf Challenge' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'Outdoor Trekking' })).toBeVisible();
  });

  it('keeps Theme query state local to discovery and only marks the matching Theme', () => {
    const { container } = renderTours('/tours?theme=GOLF_CHALLENGE');

    const focused = container.querySelectorAll('[data-focused-theme="true"]');

    expect(focused).toHaveLength(1);
    expect(focused[0]).toHaveAttribute('data-theme', 'GOLF_CHALLENGE');
    expect(within(focused[0] as HTMLElement).getByText('Your selected theme')).toBeVisible();
  });

  it('ignores unknown Theme query values instead of inventing a Theme', () => {
    const { container } = renderTours('/tours?theme=UNKNOWN_THEME');

    expect(container.querySelectorAll('[data-focused-theme="true"]')).toHaveLength(0);
  });

  it('supports multiple TourProducts in one Theme with distinct detail identities', () => {
    renderTours();

    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
    ).toHaveAttribute('href', '/tours/103');
    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 02 tour details' }),
    ).toHaveAttribute('href', '/tours/104');
  });

  it('never uses a Theme value itself as a TourProduct detail route', () => {
    renderTours();

    expect(document.querySelector('a[href="/tours/HONEYMOON_ROMANCE"]')).toBeNull();
    expect(document.querySelector('a[href="/tours/PARENTS_HEALING"]')).toBeNull();
    expect(document.querySelector('a[href="/tours/GOLF_CHALLENGE"]')).toBeNull();
    expect(document.querySelector('a[href="/tours/OUTDOOR_TREKKING"]')).toBeNull();
  });

  it('explains style restrictions without exposing price or schedule controls', () => {
    renderTours();

    const styleHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Start with a style. Then make the trip yours.',
    });

    const styleSection = styleHeading.closest('section');

    expect(styleSection).not.toBeNull();
    expect(within(styleSection as HTMLElement).getByText('Classic')).toBeVisible();
    expect(
      within(styleSection as HTMLElement).getByText(
        'Available for Golf Challenge and Outdoor Trekking.',
      ),
    ).toBeVisible();
    expect(
      within(styleSection as HTMLElement).getAllByText('Available across all four Themes.'),
    ).toHaveLength(2);

    expect(screen.queryByRole('button', { name: /schedule/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /price/i })).not.toBeInTheDocument();
  });

  it('keeps intro and style guidance visible while collection geometry is loading', () => {
    renderToursState(tourDiscoveryPreviewStates.loading);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toBeVisible();
    expect(screen.getByRole('region', { name: 'Loading tour collection' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(document.querySelectorAll('[data-tour-skeleton-group]')).toHaveLength(4);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Start with a style. Then make the trip yours.',
      }),
    ).toBeVisible();
  });

  it('renders an explicit empty collection recovery without inventing products', () => {
    const onRetry = vi.fn();

    renderToursState(tourDiscoveryPreviewStates.empty, { onRetry });

    expect(
      screen.getByRole('heading', { level: 2, name: 'No journeys to show right now.' }),
    ).toBeVisible();
    expect(screen.queryByRole('link', { name: /tour details/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders fatal mismatch as a recoverable local collection error', () => {
    const onRetry = vi.fn();

    renderToursState(tourDiscoveryPreviewStates.fatalMismatch, { onRetry });

    expect(
      screen.getByRole('heading', { level: 2, name: "We couldn't prepare this collection." }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Retry journeys' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('keeps successful Themes visible during a partial Theme failure', () => {
    const onRetryTheme = vi.fn();

    renderToursState(tourDiscoveryPreviewStates.partialFailure, { onRetryTheme });

    expect(
      screen.getByRole('link', { name: 'View Honeymoon Romance · Journey 01 tour details' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 02 tour details' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Some Parents Healing journeys are unavailable.',
      }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Retry Parents Healing journeys' }));

    expect(onRetryTheme).toHaveBeenCalledWith('PARENTS_HEALING');
  });

  it('preserves successful content while refreshing, stale, or offline', () => {
    const { unmount } = render(
      <MemoryRouter>
        <ToursPageView
          collectionState={tourDiscoveryPreviewStates.refreshing}
          focusedTheme={null}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Updating journeys');
    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
    ).toBeVisible();

    unmount();

    const staleView = renderToursState(tourDiscoveryPreviewStates.stale);

    expect(screen.getByText('Showing saved journeys while refresh is unavailable')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
    ).toBeVisible();

    staleView.unmount();

    renderToursState(tourDiscoveryPreviewStates.offline);

    expect(
      screen.getByText("You're offline. Showing saved journeys that may be out of date."),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
    ).toBeVisible();
  });

  it('keeps TourProduct navigation usable when one image fails', () => {
    renderToursState(tourDiscoveryPreviewStates.imageFailure);

    fireEvent.error(screen.getByRole('img', { name: 'Golf journey preview' }));

    expect(screen.getByText('Golf Challenge visual unavailable')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
    ).toHaveAttribute('href', '/tours/103');
  });
});
