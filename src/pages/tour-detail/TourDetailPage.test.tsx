// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import type {
  TourDetailCoreState,
  TourScheduleSectionState,
} from '@/features/tour-detail';
import {
  findTourDetailPreview,
  tourDetailPreviewStates,
} from '@/features/tour-detail/tourDetail.preview';
import {
  findTourSchedulePreview,
  tourSchedulePreviewStates,
} from '@/features/tour-detail/tourSchedule.preview';
import type { ConfigureHandoffIntent } from '@/features/reservation';
import { TourDetailPageView } from '@/pages/tour-detail/TourDetailPage';

afterEach(cleanup);

function renderView(
  coreState: TourDetailCoreState = tourDetailPreviewStates.loading,
  options: {
    onConfigure?: (intent: ConfigureHandoffIntent) => void;
    onRetry?: () => void;
    onRetrySchedule?: () => void;
    scheduleState?: TourScheduleSectionState;
  } = {},
) {
  const scheduleState =
    options.scheduleState ??
    (coreState.status === 'ready' ? findTourSchedulePreview(coreState.tour) : undefined);

  return render(
    <MemoryRouter>
      <TourDetailPageView
        coreState={coreState}
        {...(options.onConfigure !== undefined ? { onConfigure: options.onConfigure } : {})}
        {...(options.onRetry !== undefined ? { onRetry: options.onRetry } : {})}
        {...(options.onRetrySchedule !== undefined
          ? { onRetrySchedule: options.onRetrySchedule }
          : {})}
        {...(scheduleState !== undefined ? { scheduleState } : {})}
      />
    </MemoryRouter>,
  );
}

describe('TourDetailPageView core states', () => {
  it('renders the editorial core for a known TourProduct identity', () => {
    const tour = findTourDetailPreview('101');

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
    const first = findTourDetailPreview('103');
    const second = findTourDetailPreview('104');

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

    renderView(tourDetailPreviewStates.networkError, { onRetry });

    expect(
      screen.getByRole('heading', { level: 1, name: "We couldn't load this journey." }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('starts with no selected style and mirrors Honeymoon restrictions', () => {
    const tour = findTourDetailPreview('101');

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
    const tour = findTourDetailPreview('103');

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
    const parents = findTourDetailPreview('102');
    const trekking = findTourDetailPreview('105');

    if (parents === null || trekking === null) {
      throw new Error('expected Parents and Trekking preview fixtures');
    }

    const view = renderView({ status: 'ready', tour: parents });

    const parentsStyles = within(screen.getByRole('group', { name: 'Tour style options' }));

    expect(parentsStyles.getAllByRole('radio')).toHaveLength(2);
    expect(parentsStyles.queryByRole('radio', { name: /Classic/ })).not.toBeInTheDocument();
    expect(parentsStyles.getByRole('radio', { name: /Grand/ })).not.toBeChecked();
    expect(parentsStyles.getByRole('radio', { name: /Premium/ })).not.toBeChecked();

    view.rerender(
      <MemoryRouter>
        <TourDetailPageView coreState={{ status: 'ready', tour: trekking }} />
      </MemoryRouter>,
    );

    const trekkingStyles = within(screen.getByRole('group', { name: 'Tour style options' }));

    expect(trekkingStyles.getAllByRole('radio')).toHaveLength(3);
    expect(trekkingStyles.getByRole('radio', { name: /Classic/ })).not.toBeChecked();
    expect(trekkingStyles.getByRole('radio', { name: /Grand/ })).not.toBeChecked();
    expect(trekkingStyles.getByRole('radio', { name: /Premium/ })).not.toBeChecked();
  });

  it('resets local Style selection when the TourProduct identity changes', () => {
    const golf = findTourDetailPreview('103');
    const parents = findTourDetailPreview('102');

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

  it('keeps core content visible while schedules load independently', () => {
    const tour = findTourDetailPreview('103');

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    renderView({ status: 'ready', tour }, { scheduleState: tourSchedulePreviewStates.loading });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Loading tour schedules')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('tour-schedule-skeleton')).toBeVisible();
  });

  it('keeps schedule errors local and retries only the schedule section', () => {
    const tour = findTourDetailPreview('103');
    const onRetrySchedule = vi.fn();

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    renderView(
      { status: 'ready', tour },
      {
        onRetrySchedule,
        scheduleState: tourSchedulePreviewStates.networkError,
      },
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: "We couldn't load schedules." })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Retry schedules' }));

    expect(onRetrySchedule).toHaveBeenCalledTimes(1);
  });

  it('preserves schedule choices through partial error, refreshing, and stale states', () => {
    const tour = findTourDetailPreview('103');

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    const view = renderView(
      { status: 'ready', tour },
      { scheduleState: tourSchedulePreviewStates.partialError },
    );

    expect(
      screen.getByRole('heading', { name: 'Some schedule information is unavailable.' }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('group', { name: 'Tour schedule options' })).getAllByRole('radio'),
    ).toHaveLength(2);

    view.rerender(
      <MemoryRouter>
        <TourDetailPageView
          coreState={{ status: 'ready', tour }}
          scheduleState={tourSchedulePreviewStates.refreshing}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Updating schedules')).toBeVisible();
    expect(
      within(screen.getByRole('group', { name: 'Tour schedule options' })).getAllByRole('radio'),
    ).toHaveLength(2);

    view.rerender(
      <MemoryRouter>
        <TourDetailPageView
          coreState={{ status: 'ready', tour }}
          scheduleState={tourSchedulePreviewStates.stale}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Showing saved schedules while refresh is unavailable')).toBeVisible();
    expect(
      within(screen.getByRole('group', { name: 'Tour schedule options' })).getAllByRole('radio'),
    ).toHaveLength(2);
  });

  it('renders unavailable schedules as disabled and never preselects a schedule', () => {
    const tour = findTourDetailPreview('103');

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    renderView({ status: 'ready', tour }, { scheduleState: tourSchedulePreviewStates.unavailable });

    const radios = within(
      screen.getByRole('group', { name: 'Tour schedule options' }),
    ).getAllByRole('radio');

    expect(radios).toHaveLength(2);
    expect(radios.every((radio) => !radio.hasAttribute('checked'))).toBe(true);
    expect(radios.every((radio) => radio.hasAttribute('disabled'))).toBe(true);
    expect(screen.getByText('No schedule is currently selectable.')).toBeVisible();
  });

  it('uses Honeymoon recruitment wording without client-side count derivation', () => {
    const tour = findTourDetailPreview('101');

    if (tour === null) {
      throw new Error('expected Honeymoon preview fixture');
    }

    renderView({ status: 'ready', tour });

    expect(
      screen.getByText('2 couples/teams required · 1 couple/team = 2 participants'),
    ).toBeVisible();
    expect(screen.queryByText(/currentCount|requiredCount|confirmed/i)).not.toBeInTheDocument();
  });

  it('selects only available schedule choices and resets selection when they become unavailable', () => {
    const tour = findTourDetailPreview('103');

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    const view = renderView({ status: 'ready', tour });

    const available = screen.getByRole('radio', { name: /Schedule preview A/ });
    const unavailable = screen.getByRole('radio', { name: /Schedule preview B/ });

    expect(available).not.toBeChecked();
    expect(unavailable).toBeDisabled();

    fireEvent.click(available);
    expect(available).toBeChecked();

    view.rerender(
      <MemoryRouter>
        <TourDetailPageView
          coreState={{ status: 'ready', tour }}
          scheduleState={tourSchedulePreviewStates.unavailable}
        />
      </MemoryRouter>,
    );

    expect(
      within(screen.getByRole('group', { name: 'Tour schedule options' }))
        .getAllByRole('radio')
        .every((radio) => !radio.matches(':checked')),
    ).toBe(true);
  });

  it('keeps Configure disabled until both Style and an available Schedule are selected', () => {
    const tour = findTourDetailPreview('103');
    const onConfigure = vi.fn();

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    renderView({ status: 'ready', tour }, { onConfigure });

    const configure = screen.getByRole('button', { name: 'Configure this trip' });

    expect(configure).toBeDisabled();
    expect(screen.getByText('Choose a tour style before continuing.')).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: /Grand/ }));

    expect(configure).toBeDisabled();
    expect(screen.getByText('Choose an available schedule before continuing.')).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: /Schedule preview A/ }));

    expect(configure).toBeEnabled();
    expect(
      screen.getByText('Your selected style and schedule will carry into trip configuration.'),
    ).toBeVisible();
    expect(onConfigure).not.toHaveBeenCalled();
  });

  it('hands the selected TourProduct, Style, and Schedule to the public Configure boundary once', () => {
    const tour = findTourDetailPreview('103');
    const onConfigure = vi.fn();

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    renderView({ status: 'ready', tour }, { onConfigure });

    fireEvent.click(screen.getByRole('radio', { name: /Premium/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Schedule preview A/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Configure this trip' }));

    expect(onConfigure).toHaveBeenCalledTimes(1);
    expect(onConfigure).toHaveBeenCalledWith({
      tourProductId: '103',
      tourStyle: 'PREMIUM',
      tourScheduleId: '1301',
    });
  });

  it('disables Configure again when the selected Schedule becomes unavailable', () => {
    const tour = findTourDetailPreview('103');
    const onConfigure = vi.fn();

    if (tour === null) {
      throw new Error('expected Golf preview fixture');
    }

    const view = renderView({ status: 'ready', tour }, { onConfigure });

    fireEvent.click(screen.getByRole('radio', { name: /Classic/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Schedule preview A/ }));

    expect(screen.getByRole('button', { name: 'Configure this trip' })).toBeEnabled();

    view.rerender(
      <MemoryRouter>
        <TourDetailPageView
          coreState={{ status: 'ready', tour }}
          onConfigure={onConfigure}
          scheduleState={tourSchedulePreviewStates.unavailable}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'Configure this trip' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Configure this trip' }));

    expect(onConfigure).not.toHaveBeenCalled();
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
