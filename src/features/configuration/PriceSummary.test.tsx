// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  getCompactPriceLabel,
  PriceSummary,
  type PriceDisplayModel,
} from '@/features/configuration';

describe('PriceSummary', () => {
  it('shows a known display label without interpreting its numeric meaning', () => {
    render(<PriceSummary price={{ state: 'known', totalLabel: 'Fixture displayed total' }} />);

    expect(screen.getByText('Fixture displayed total')).toBeVisible();
  });

  it('uses skeleton loading when there is no previous total and never flashes an invented zero', () => {
    const { container } = render(
      <PriceSummary price={{ state: 'loading', previousTotalLabel: null }} />,
    );

    const loading = screen.getByLabelText('Price loading');

    expect(loading).toHaveAttribute('aria-busy', 'true');
    expect(loading.querySelector('[data-skeleton-variant="line"]')).not.toBeNull();
    expect(container.textContent).not.toMatch(/0/);
  });

  it('keeps the previous total visible while checking the latest price', () => {
    render(
      <PriceSummary price={{ state: 'loading', previousTotalLabel: 'Fixture previous total' }} />,
    );

    expect(screen.getByText('Fixture previous total')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Checking latest price');
  });

  it('keeps the previous total visible while recalculating', () => {
    render(
      <PriceSummary
        price={{ state: 'recalculating', previousTotalLabel: 'Fixture previous total' }}
      />,
    );

    expect(screen.getByText('Fixture previous total')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Updating price');
  });

  it('keeps a previous total through an error and retries only the price boundary', () => {
    const onRetry = vi.fn();

    render(
      <PriceSummary
        onRetry={onRetry}
        price={{
          state: 'error',
          previousTotalLabel: 'Fixture previous total',
          message: 'Price refresh failed.',
        }}
      />,
    );

    expect(screen.getByText('Fixture previous total')).toBeVisible();
    expect(screen.getByText('Price refresh failed.')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Retry price' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows an error without inventing a fallback total when no previous price exists', () => {
    const { container } = render(
      <PriceSummary
        price={{
          state: 'error',
          previousTotalLabel: null,
          message: 'Price is temporarily unavailable.',
        }}
      />,
    );

    expect(screen.getByText('Price is temporarily unavailable.')).toBeVisible();
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).not.toMatch(/0/);
  });

  it('derives compact labels only from the supplied presentation state', () => {
    const cases: Array<[PriceDisplayModel, string]> = [
      [{ state: 'known', totalLabel: 'Known label' }, 'Known label'],
      [{ state: 'loading', previousTotalLabel: null }, 'Price loading'],
      [{ state: 'loading', previousTotalLabel: 'Previous label' }, 'Previous label · Checking'],
      [
        { state: 'recalculating', previousTotalLabel: 'Previous label' },
        'Previous label · Updating',
      ],
      [
        { state: 'error', previousTotalLabel: 'Previous label', message: 'Failed' },
        'Previous label',
      ],
      [{ state: 'error', previousTotalLabel: null, message: 'Failed' }, 'Price unavailable'],
      [{ state: 'unavailable', message: 'Not contract-backed' }, 'Price unavailable'],
    ];

    for (const [price, expected] of cases) {
      expect(getCompactPriceLabel(price)).toBe(expected);
    }
  });
});
