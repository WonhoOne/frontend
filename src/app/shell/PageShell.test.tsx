// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageShell } from '@/app/shell/PageShell';

describe('PageShell', () => {
  it('owns the route-level H1 and preserves Page content', () => {
    render(
      <PageShell eyebrow="Runtime" title="Route title">
        <p>Page content</p>
      </PageShell>,
    );

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Route title' })).toBeVisible();
    expect(screen.getByText('Runtime')).toBeVisible();
    expect(screen.getByText('Page content')).toBeVisible();
  });

  it('supports approved container widths without adding Product semantics', () => {
    render(
      <PageShell containerVariant="reading" title="Reading route">
        <p>Reading content</p>
      </PageShell>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Reading route' })).toBeVisible();
    expect(screen.getByText('Reading content')).toBeVisible();
  });
});
