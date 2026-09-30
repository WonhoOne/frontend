// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, Outlet, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RouteFocusManager } from '@/app/router/RouteFocusManager';

function RuntimeLayout() {
  return (
    <>
      <RouteFocusManager />

      <nav aria-label="Test navigation">
        <Link to="/">Home</Link>
        <Link to="/tours">Tours</Link>
        <Link to="/my-trips">My Trips</Link>
      </nav>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

function createTestRouter() {
  return createMemoryRouter(
    [
      {
        element: <RuntimeLayout />,
        children: [
          {
            index: true,
            element: <h1>Home</h1>,
          },
          {
            path: '/tours',
            element: <h1>Tours</h1>,
          },
          {
            path: '/my-trips',
            element: <h1>My Trips</h1>,
          },
        ],
      },
    ],
    {
      initialEntries: ['/'],
    },
  );
}

describe('RouteFocusManager', () => {
  it('preserves initial direct-load focus so the browser keyboard order stays intact', () => {
    const router = createTestRouter();

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('main')).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it('moves focus to the main landmark after an in-app PUSH navigation', async () => {
    const router = createTestRouter();
    const user = userEvent.setup();

    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole('link', { name: 'Tours' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Tours' })).toBeVisible();
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('moves focus to the main landmark after browser-history POP navigation', async () => {
    const router = createTestRouter();
    const user = userEvent.setup();

    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole('link', { name: 'Tours' }));
    await user.click(screen.getByRole('link', { name: 'My Trips' }));

    await router.navigate(-1);

    expect(await screen.findByRole('heading', { level: 1, name: 'Tours' })).toBeVisible();
    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveFocus();
    });
  });
});
