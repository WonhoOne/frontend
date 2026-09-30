// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RouteMotionBoundary } from '@/app/router/RouteMotionBoundary';

function MotionLayout() {
  return (
    <>
      <nav aria-label="Motion test navigation">
        <Link to="/">Home</Link>
        <Link to="/tours">Tours</Link>
        <Link to="/my-trips">My Trips</Link>
      </nav>
      <RouteMotionBoundary />
    </>
  );
}

function createTestRouter() {
  return createMemoryRouter(
    [
      {
        element: <MotionLayout />,
        children: [
          { index: true, element: <h1>Home</h1> },
          { path: '/tours', element: <h1>Tours</h1> },
          { path: '/my-trips', element: <h1>My Trips</h1> },
        ],
      },
    ],
    { initialEntries: ['/'] },
  );
}

function motionSurface() {
  const heading = screen.getByRole('heading', { level: 1 });

  return heading.parentElement;
}

describe('RouteMotionBoundary', () => {
  it('uses entry motion on direct mount and forward motion for PUSH navigation', async () => {
    const router = createTestRouter();
    const user = userEvent.setup();

    render(<RouterProvider router={router} />);

    expect(motionSurface()).toHaveAttribute('data-route-motion-direction', 'entry');

    await user.click(screen.getByRole('link', { name: 'Tours' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Tours' })).toBeVisible();
    expect(motionSurface()).toHaveAttribute('data-route-motion-direction', 'forward');
  });

  it('distinguishes Back and Forward POP navigation by location-key history', async () => {
    const router = createTestRouter();
    const user = userEvent.setup();

    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole('link', { name: 'Tours' }));
    await user.click(screen.getByRole('link', { name: 'My Trips' }));

    window.dispatchEvent(new PopStateEvent('popstate', { state: { idx: 0 } }));
    await router.navigate(-1);
    await screen.findByRole('heading', { level: 1, name: 'Tours' });

    await waitFor(() => {
      expect(motionSurface()).toHaveAttribute('data-route-motion-direction', 'back');
    });

    window.dispatchEvent(new PopStateEvent('popstate', { state: { idx: 1 } }));
    await router.navigate(1);
    await screen.findByRole('heading', { level: 1, name: 'My Trips' });

    await waitFor(() => {
      expect(motionSurface()).toHaveAttribute('data-route-motion-direction', 'forward');
    });
  });

  it('lets the latest navigation replace prior motion instead of queueing surfaces', async () => {
    const router = createTestRouter();

    render(<RouterProvider router={router} />);

    void router.navigate('/tours');
    await router.navigate('/my-trips');

    expect(await screen.findByRole('heading', { level: 1, name: 'My Trips' })).toBeVisible();
    expect(screen.queryByRole('heading', { level: 1, name: 'Tours' })).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-route-motion-key]')).toHaveLength(1);
  });
});
