// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { AppErrorBoundary } from '@/app/errors/AppErrorBoundary';

function CrashingComponent(): ReactElement {
  throw new Error('Expected test crash');
}

describe('AppErrorBoundary', () => {
  it('shows the application fallback when a child render fails', () => {
    render(
      <AppErrorBoundary>
        <CrashingComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('An unexpected error occurred.');
    expect(screen.getByRole('heading', { name: 'Application unavailable' })).toBeVisible();
  });
});
