// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '@/app/router/routes';

afterEach(cleanup);

const routeCases = [
  ['/', 'Home'],
  ['/tours', 'Tours'],
  ['/tours/test-tour-id', 'Tour Detail'],
  ['/tours/test-tour-id/configure', 'Configure'],
  ['/reservation/review', 'Reservation Review'],
  ['/reservation/test-reservation-id/success', 'Reservation Success'],
  ['/reservations/test-reservation-id', 'Reservation Detail'],
  ['/login', 'Login'],
  ['/signup', 'Signup'],
  ['/my-trips', 'My Trips'],
] as const;

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  });

  return render(<RouterProvider router={router} />);
}

describe('foundation route table', () => {
  it.each(routeCases)('mounts %s as %s with the route accessibility baseline', (path, title) => {
    renderRoute(path);

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    const main = screen.getByRole('main');

    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main-content',
    );
  });

  it('exposes the matched tourId on the dynamic Tour Detail placeholder', () => {
    renderRoute('/tours/test-tour-id');

    expect(screen.getByText('tourId')).toBeVisible();
    expect(screen.getByText('test-tour-id')).toBeVisible();
  });

  it('exposes the matched reservationId on the dynamic Reservation Detail placeholder', () => {
    renderRoute('/reservations/test-reservation-id');

    expect(screen.getByText('reservationId')).toBeVisible();
    expect(screen.getByText('test-reservation-id')).toBeVisible();
  });

  it('uses GlobalHeader for public routes without interpreting Auth state', () => {
    renderRoute('/tours');

    const primaryNavigation = screen.getByRole('navigation', { name: 'Primary' });

    expect(within(primaryNavigation).getByRole('link', { name: 'Tours' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      within(primaryNavigation).getByRole('link', { name: 'Login / Account' }),
    ).toHaveAttribute('href', '/login');
  });

  it('uses TransactionHeader for configuration and reservation routes', () => {
    renderRoute('/reservation/review');

    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
    expect(screen.getByText('Reservation Review', { selector: 'header p' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Mister World' })).toHaveAttribute('href', '/');
  });

  it('renders the application Not Found route with keyboard-accessible recovery links', () => {
    renderRoute('/unknown-foundation-route');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();

    const recovery = screen.getByRole('navigation', { name: 'Not found recovery' });

    expect(within(recovery).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(recovery).getByRole('link', { name: 'Tours' })).toHaveAttribute('href', '/tours');
  });
});
