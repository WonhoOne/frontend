// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '@/app/providers/AppProviders';
import { routeBuilders, routePaths, routeTitles } from '@/app/router/paths';
import { appRoutes } from '@/app/router/routes';

afterEach(cleanup);

const routeCases = [
  [routePaths.home, routeTitles.home, 'A journey made for your moment.'],
  [routePaths.tours, routeTitles.tours, 'Four ways to travel differently.'],
  [routeBuilders.tourDetail('test-tour-id'), routeTitles.tourDetail, routeTitles.tourDetail],
  [routeBuilders.configure('test-tour-id'), routeTitles.configure, routeTitles.configure],
  [routePaths.reservationReview, routeTitles.reservationReview, routeTitles.reservationReview],
  [
    routeBuilders.reservationSuccess('test-reservation-id'),
    routeTitles.reservationSuccess,
    routeTitles.reservationSuccess,
  ],
  [
    routeBuilders.reservationDetail('test-reservation-id'),
    routeTitles.reservationDetail,
    routeTitles.reservationDetail,
  ],
  [routePaths.login, routeTitles.login, routeTitles.login],
  [routePaths.signup, routeTitles.signup, routeTitles.signup],
  [routePaths.myTrips, routeTitles.myTrips, routeTitles.myTrips],
] as const;

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  });

  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}

describe('foundation route table', () => {
  it.each(routeCases)(
    'mounts %s as %s with the route accessibility baseline',
    (path, _title, accessibleHeading) => {
      renderRoute(path);

      expect(screen.getByRole('heading', { level: 1, name: accessibleHeading })).toBeVisible();
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

      const main = screen.getByRole('main');

      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
        'href',
        '#main-content',
      );
    },
  );

  it('exposes the matched tourId on the dynamic Tour Detail placeholder', () => {
    renderRoute(routeBuilders.tourDetail('test-tour-id'));

    expect(screen.getByText('tourId')).toBeVisible();
    expect(screen.getByText('test-tour-id')).toBeVisible();
  });

  it('exposes the matched reservationId on the dynamic Reservation Detail placeholder', () => {
    renderRoute(routeBuilders.reservationDetail('test-reservation-id'));

    expect(screen.getByText('reservationId')).toBeVisible();
    expect(screen.getByText('test-reservation-id')).toBeVisible();
  });

  it('uses GlobalHeader for public routes without interpreting Auth state', () => {
    renderRoute(routePaths.tours);

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
    renderRoute(routePaths.reservationReview);

    expect(screen.queryByRole('navigation', { name: 'Primary' })).not.toBeInTheDocument();
    expect(screen.getByText(routeTitles.reservationReview, { selector: 'header p' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 1, name: routeTitles.reservationReview }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Mister World' })).toHaveAttribute('href', '/');
  });

  it('renders the application Not Found route with keyboard-accessible recovery links', () => {
    renderRoute('/unknown-foundation-route');

    expect(screen.getByRole('heading', { level: 1, name: routeTitles.notFound })).toBeVisible();

    const recovery = screen.getByRole('navigation', { name: 'Not found recovery' });

    expect(within(recovery).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(recovery).getByRole('link', { name: 'Tours' })).toHaveAttribute('href', '/tours');
  });
});
