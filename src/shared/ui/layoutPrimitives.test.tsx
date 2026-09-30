// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import gridStyles from '@/shared/ui/Grid/Grid.module.css';
import { Grid } from '@/shared/ui/Grid/Grid';
import pageContainerStyles from '@/shared/ui/PageContainer/PageContainer.module.css';
import { PageContainer, type PageContainerVariant } from '@/shared/ui/PageContainer/PageContainer';

afterEach(cleanup);

const containerVariants: PageContainerVariant[] = [
  'wide',
  'main',
  'transaction',
  'reading',
  'auth',
];

describe('PageContainer', () => {
  it.each(containerVariants)('maps the %s variant to its layout class', (variant) => {
    render(
      <PageContainer data-testid="container" variant={variant}>
        Content
      </PageContainer>,
    );

    const container = screen.getByTestId('container');
    const rootClass = pageContainerStyles.root;
    const variantClass = pageContainerStyles[variant];

    if (rootClass === undefined || variantClass === undefined) {
      throw new Error(`Missing PageContainer CSS module class for variant: ${variant}`);
    }

    expect(container).toHaveClass(rootClass);
    expect(container).toHaveClass(variantClass);
  });

  it('preserves caller DOM attributes and class names', () => {
    render(
      <PageContainer aria-label="Example layout" className="custom-layout" data-testid="container">
        Content
      </PageContainer>,
    );

    expect(screen.getByTestId('container')).toHaveAttribute('aria-label', 'Example layout');
    expect(screen.getByTestId('container')).toHaveClass('custom-layout');
  });
});

describe('Grid', () => {
  it('provides the shared grid class while preserving caller attributes', () => {
    render(
      <Grid aria-label="Example grid" className="custom-grid" data-testid="grid">
        <span>Item</span>
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    const rootClass = gridStyles.root;

    if (rootClass === undefined) {
      throw new Error('Missing Grid root CSS module class.');
    }

    expect(grid).toHaveClass(rootClass);
    expect(grid).toHaveClass('custom-grid');
    expect(grid).toHaveAttribute('aria-label', 'Example grid');
  });
});
