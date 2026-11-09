// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ConfigurePage } from '@/pages/configure/ConfigurePage';

describe('ConfigurePage with an invalid tour id', () => {
  it.each(['/tours/abc/configure', '/tours/0/configure', '/tours/012/configure'])(
    'shows a recovery message instead of an empty page for %s',
    (path) => {
      const router = createMemoryRouter(
        [{ path: '/tours/:tourId/configure', element: <ConfigurePage /> }],
        { initialEntries: [path] },
      );
      render(<RouterProvider router={router} />);

      expect(screen.getByRole('heading', { level: 1, name: 'Configure' })).toBeVisible();
      expect(screen.getByText("This trip couldn't be found")).toBeVisible();
      expect(screen.getByRole('link', { name: 'Browse tours' })).toHaveAttribute('href', '/tours');
    },
  );
});
