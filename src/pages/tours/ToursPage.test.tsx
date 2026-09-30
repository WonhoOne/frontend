import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ToursPage } from '@/pages/tours/ToursPage';

function renderTours(initialEntry = '/tours') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ToursPage />
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
    const { container } = render(
      <MemoryRouter initialEntries={['/tours?theme=GOLF_CHALLENGE']}>
        <ToursPage />
      </MemoryRouter>,
    );

    const focused = container.querySelectorAll('[data-focused-theme="true"]');

    expect(focused).toHaveLength(1);
    expect(focused[0]).toHaveAttribute('data-theme', 'GOLF_CHALLENGE');
    expect(within(focused[0] as HTMLElement).getByText('Your selected theme')).toBeVisible();
  });

  it('ignores unknown Theme query values instead of inventing a Theme', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/tours?theme=UNKNOWN_THEME']}>
        <ToursPage />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll('[data-focused-theme="true"]')).toHaveLength(0);
  });

  it('supports multiple TourProducts in one Theme with distinct detail identities', () => {
    renderTours();

    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
    ).toHaveAttribute('href', '/tours/demo-golf-product-a');
    expect(
      screen.getByRole('link', { name: 'View Golf Challenge · Journey 02 tour details' }),
    ).toHaveAttribute('href', '/tours/demo-golf-product-b');
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
});
