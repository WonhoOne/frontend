// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ConfigurationOptionGroup,
  createContractNeutralConfigureFixture,
  type OptionGroupModel,
} from '@/features/configuration';

function group(category: OptionGroupModel['category']) {
  const match = createContractNeutralConfigureFixture().groups.find(
    (candidate) => candidate.category === category,
  );

  if (match === undefined) {
    throw new Error(`Missing fixture group: ${category}`);
  }

  return match;
}

describe('ConfigurationOptionGroup state matrix', () => {
  it('keeps the section heading while loading and uses skeleton geometry instead of a spinner', () => {
    render(
      <ConfigurationOptionGroup
        group={group('hotel')}
        onRetry={vi.fn()}
        onReturnToTour={vi.fn()}
        onSelect={vi.fn()}
        runtimeState={{ status: 'loading' }}
        selectedKey={null}
        stepNumber={1}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Hotel' })).toBeVisible();

    const loading = screen.getByLabelText('Hotel options loading');
    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(within(loading).getAllByTestId('configuration-option-skeleton')).toHaveLength(2);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('keeps failures local and delegates retry to the affected group only', () => {
    const onRetry = vi.fn();

    render(
      <ConfigurationOptionGroup
        group={group('transport')}
        onRetry={onRetry}
        onReturnToTour={vi.fn()}
        onSelect={vi.fn()}
        runtimeState={{ status: 'error', isRetrying: false }}
        selectedKey={null}
        stepNumber={2}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Transport' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Transport options unavailable' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Retry Transport' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('keeps existing options interactive during refreshing and stale states', () => {
    const { rerender } = render(
      <ConfigurationOptionGroup
        group={group('meal')}
        onRetry={vi.fn()}
        onReturnToTour={vi.fn()}
        onSelect={vi.fn()}
        runtimeState={{ status: 'refreshing' }}
        selectedKey="fixture:meal:a"
        stepNumber={3}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Updating availability');
    expect(screen.getByRole('radio', { name: /Fixture meal A/i })).toBeChecked();

    rerender(
      <ConfigurationOptionGroup
        group={group('meal')}
        onRetry={vi.fn()}
        onReturnToTour={vi.fn()}
        onSelect={vi.fn()}
        runtimeState={{ status: 'stale' }}
        selectedKey="fixture:meal:a"
        stepNumber={3}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Availability may be out of date');
    expect(screen.getByRole('radio', { name: /Fixture meal A/i })).toBeChecked();
  });

  it('treats a required empty group as blocking recovery instead of auto-selecting a fallback', () => {
    const onReturnToTour = vi.fn();

    render(
      <ConfigurationOptionGroup
        group={group('hotel')}
        onRetry={vi.fn()}
        onReturnToTour={onReturnToTour}
        onSelect={vi.fn()}
        runtimeState={{ status: 'empty' }}
        selectedKey={null}
        stepNumber={1}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No hotel options available' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Back to tour details' }));

    expect(onReturnToTour).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('keeps optional Extras empty state compact and does not invent a selection interaction', () => {
    render(
      <ConfigurationOptionGroup
        group={group('extras')}
        onRetry={vi.fn()}
        onReturnToTour={vi.fn()}
        onSelect={vi.fn()}
        runtimeState={{ status: 'empty' }}
        selectedKey={null}
        stepNumber={4}
      />,
    );

    expect(screen.getByText('No extras are available for this trip.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Back to tour details' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('preserves an invalid selected option and requires an explicit replacement', () => {
    const onSelect = vi.fn();

    render(
      <ConfigurationOptionGroup
        group={group('transport')}
        onRetry={vi.fn()}
        onReturnToTour={vi.fn()}
        onSelect={onSelect}
        runtimeState={{ status: 'invalid' }}
        selectedKey="fixture:transport:a"
        stepNumber={2}
      />,
    );

    const invalidSelection = screen.getByRole('radio', { name: /Fixture transport A/i });

    expect(invalidSelection).toBeChecked();
    expect(invalidSelection).toBeDisabled();
    expect(
      screen.getByText(
        'Your selected transport option is no longer available. Choose another option.',
      ),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: /Fixture transport B/i }));

    expect(onSelect).toHaveBeenCalledWith('fixture:transport:b');
  });

  it('keeps catalog-disabled options disabled with their local reason', () => {
    const hotel = group('hotel');
    const disabledGroup: OptionGroupModel = {
      ...hotel,
      options: hotel.options.map((option, index) =>
        index === 0
          ? {
              ...option,
              availability: { status: 'disabled', reason: 'Unavailable in this fixture state.' },
            }
          : option,
      ),
    };

    render(
      <ConfigurationOptionGroup
        group={disabledGroup}
        onRetry={vi.fn()}
        onReturnToTour={vi.fn()}
        onSelect={vi.fn()}
        runtimeState={{ status: 'ready' }}
        selectedKey={null}
        stepNumber={1}
      />,
    );

    expect(screen.getByRole('radio', { name: /Fixture hotel A/i })).toBeDisabled();
    expect(screen.getByText('Unavailable in this fixture state.')).toBeVisible();
  });
});
