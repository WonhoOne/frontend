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
  [routeBuilders.tourDetail('101'), routeTitles.tourDetail, 'Honeymoon Romance · Journey 01'],
  [routeBuilders.configure('101'), routeTitles.configure, routeTitles.configure],
  [routePaths.reservationReview, routeTitles.reservationReview, routeTitles.reservationReview],
  [routeBuilders.reservationSuccess('801'), routeTitles.reservationSuccess, 'Reservation received'],
  [routeBuilders.reservationDetail('801'), routeTitles.reservationDetail, 'Mock 제주 허니문'],
  [routePaths.login, routeTitles.login, routeTitles.login],
  [routePaths.signup, routeTitles.signup, routeTitles.signup],
  [routePaths.myTrips, routeTitles.myTrips, routeTitles.login],
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
    async (path, _title, accessibleHeading) => {
      renderRoute(path);

      expect(
        await screen.findByRole('heading', { level: 1, name: accessibleHeading }),
      ).toBeVisible();
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

  it('renders distinct TourProduct identities through the dynamic Tour Detail route', async () => {
    renderRoute(routeBuilders.tourDetail('104'));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Golf Challenge · Journey 02' }),
    ).toBeVisible();
  });

  it('renders Reservation Detail from the private reservation lookup', async () => {
    renderRoute(routeBuilders.reservationDetail('801'));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mock 제주 허니문' }),
    ).toBeVisible();
    expect(screen.getByText('Reservation #801')).toBeVisible();
  });

  it('does not disclose whether an unavailable reservation exists', async () => {
    renderRoute(routeBuilders.reservationDetail('999999'));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reservation not found' }),
    ).toBeVisible();
    expect(screen.getByText('This reservation is unavailable or cannot be shown.')).toBeVisible();
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
