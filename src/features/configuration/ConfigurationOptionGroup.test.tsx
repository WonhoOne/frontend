// @vitest-environment jsdom

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  ConfigurationOptionGroup,
  createContractNeutralConfigureFixture,
  createSharedContractConfigureScenario,
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
        'Your selected transport option is no longer available. Change the selection.',
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

describe('Shared v0.2 Extras checkbox primitive', () => {
  const extras = () => {
    const group = createSharedContractConfigureScenario().groups.find(
      (candidate) => candidate.category === 'extras',
    );
    if (group === undefined) throw new Error('Missing canonical Extras group');
    return group;
  };

  it('renders two distinct labelled checkboxes without changing single-select radios', () => {
    const onToggle = vi.fn();
    render(
      <ConfigurationOptionGroup
        group={extras()}
        onSelect={vi.fn()}
        onToggle={onToggle}
        selectedKey={null}
        selectedKeys={[]}
        stepNumber={4}
      />,
    );

    expect(screen.getByRole('group', { name: 'Extras' })).toBeVisible();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).not.toBeChecked();

    fireEvent.click(screen.getByRole('checkbox', { name: /Champagne/i }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith('CHAMPAGNE');
  });

  it('reflects controlled selection sets and delegates add/remove to the parent', () => {
    const onToggle = vi.fn();
    const renderGroup = (selectionKeys: readonly string[]) => (
      <ConfigurationOptionGroup
        group={extras()}
        onSelect={vi.fn()}
        onToggle={onToggle}
        selectedKey={null}
        selectedKeys={selectionKeys}
        stepNumber={4}
      />
    );

    const { rerender } = render(renderGroup(['CHAMPAGNE']));
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).not.toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: /Coffee/i }));
    expect(onToggle).toHaveBeenLastCalledWith('COFFEE');

    rerender(renderGroup(['CHAMPAGNE', 'COFFEE']));
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeChecked();

    fireEvent.click(screen.getByRole('checkbox', { name: /Champagne/i }));
    expect(onToggle).toHaveBeenLastCalledWith('CHAMPAGNE');
    rerender(renderGroup(['COFFEE']));
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeChecked();
  });

  it('supports native keyboard activation and keeps refreshing options available', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfigurationOptionGroup
        group={extras()}
        onSelect={vi.fn()}
        onToggle={onToggle}
        runtimeState={{ status: 'refreshing' }}
        selectedKey={null}
        selectedKeys={[]}
        stepNumber={4}
      />,
    );

    const coffee = screen.getByRole('checkbox', { name: /Coffee/i });
    coffee.focus();
    expect(coffee).toHaveFocus();
    expect(coffee).toBeEnabled();
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledExactlyOnceWith('COFFEE');
    expect(screen.getByRole('status')).toHaveTextContent('Updating availability');
  });

  it('disables unavailable and invalid selections while retaining their checked truth', () => {
    const onToggle = vi.fn();
    const extrasGroup = extras();
    const disabled: OptionGroupModel = {
      ...extrasGroup,
      options: extrasGroup.options.map((option) =>
        option.selectionKey === 'COFFEE'
          ? {
              ...option,
              availability: { status: 'disabled', reason: 'Not selectable now.' },
            }
          : option,
      ),
    };

    const { rerender } = render(
      <ConfigurationOptionGroup
        group={disabled}
        onSelect={vi.fn()}
        onToggle={onToggle}
        selectedKey={null}
        selectedKeys={['COFFEE']}
        stepNumber={4}
      />,
    );
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeDisabled();
    expect(screen.getByText('Not selectable now.')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).toBeEnabled();

    rerender(
      <ConfigurationOptionGroup
        group={extrasGroup}
        onSelect={vi.fn()}
        onToggle={onToggle}
        runtimeState={{ status: 'invalid' }}
        selectedKey={null}
        selectedKeys={['CHAMPAGNE']}
        stepNumber={4}
      />,
    );
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Champagne/i })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /Coffee/i })).toBeEnabled();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('does not expose a seemingly interactive checkbox before an owning toggle callback exists', () => {
    render(
      <ConfigurationOptionGroup
        group={extras()}
        onSelect={vi.fn()}
        selectedKey={null}
        selectedKeys={[]}
        stepNumber={4}
      />,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeDisabled();
    }
  });
});
