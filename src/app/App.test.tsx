// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

function QueryClientProbe() {
  const queryClient = useQueryClient();

  return <output>{queryClient ? 'query-provider-ready' : 'query-provider-missing'}</output>;
}

describe('App Foundation composition', () => {
  it('mounts the application shell and approved Home route', () => {
    window.history.replaceState({}, '', '/');

    render(<App />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(
      screen.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
    ).toBeVisible();
  });

  it('makes the global QueryClient available through AppProviders', () => {
    render(
      <AppProviders>
        <QueryClientProbe />
      </AppProviders>,
    );

    expect(screen.getByText('query-provider-ready')).toBeVisible();
  });
});
