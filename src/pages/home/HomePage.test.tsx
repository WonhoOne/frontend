import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routeBuilders, routePaths } from '@/app/router/paths';
import { HomePage } from '@/pages/home/HomePage';

describe('HomePage', () => {
  it('renders one H1 and the four approved Theme headings in logical DOM order', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
    ).toBeVisible();

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(['Honeymoon Romance', 'Parents Healing', 'Golf Challenge', 'Outdoor Trekking']);
  });

  it('routes the hero and customization actions to the Tours collection', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Explore Theme Tours' })).toHaveAttribute(
      'href',
      routePaths.tours,
    );
    expect(screen.getByRole('link', { name: /See all tours/ })).toHaveAttribute(
      'href',
      routePaths.tours,
    );
  });

  it('keeps Theme navigation as Frontend-local Tours state instead of treating Theme as tourId', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const golfLink = screen.getByRole('link', { name: 'Explore Golf Challenge theme tours' });

    expect(golfLink).toHaveAttribute('href', routeBuilders.toursByTheme('GOLF_CHALLENGE'));
    expect(golfLink).not.toHaveAttribute('href', '/tours/GOLF_CHALLENGE');
  });

  it('provides descriptive accessible names for all Theme actions', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Explore Honeymoon Romance theme tours' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Explore Parents Healing theme tours' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Explore Golf Challenge theme tours' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Explore Outdoor Trekking theme tours' }),
    ).toBeVisible();
  });

  it('keeps all static Theme content available without waiting for image assets', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Honeymoon Romance' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Parents Healing' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Golf Challenge' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Outdoor Trekking' })).toBeVisible();
  });

  it('exposes semantic main-page sections and footer navigation without a second page H1', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Find the journey that feels like yours.' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'A package is only the starting point.' }),
    ).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
