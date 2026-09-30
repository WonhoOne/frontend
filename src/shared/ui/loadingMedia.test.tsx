// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ImageFrame } from '@/shared/ui/ImageFrame/ImageFrame';
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton';

afterEach(cleanup);

describe('Skeleton', () => {
  it('stays hidden from assistive technology', () => {
    render(<Skeleton data-testid="skeleton" variant="line" />);

    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-skeleton-variant', 'line');
  });

  it('supports only generic loading geometry variants', () => {
    const { rerender } = render(<Skeleton data-testid="skeleton" variant="block" />);

    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-skeleton-variant', 'block');

    rerender(<Skeleton data-testid="skeleton" variant="circle" />);

    expect(screen.getByTestId('skeleton')).toHaveAttribute('data-skeleton-variant', 'circle');
  });
});

describe('ImageFrame', () => {
  it('renders a neutral placeholder without inventing image semantics when src is absent', () => {
    const { container } = render(
      <ImageFrame alt="Tour coastline" aspectRatio="4 / 3" data-testid="frame" />,
    );

    expect(screen.getByTestId('frame')).toHaveAttribute('data-image-state', 'placeholder');
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('keeps loading geometry stable and propagates image attributes', () => {
    render(
      <ImageFrame
        alt="Tour coastline"
        aspectRatio="16 / 9"
        data-testid="frame"
        loading="eager"
        objectFit="contain"
        src="/tour.jpg"
      />,
    );

    const frame = screen.getByTestId('frame');
    const image = screen.getByRole('img', { name: 'Tour coastline' });

    expect(frame).toHaveAttribute('data-image-state', 'loading');
    expect(frame).toHaveStyle({ aspectRatio: '16 / 9' });
    expect(image).toHaveAttribute('src', '/tour.jpg');
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('reveals a successfully loaded image', () => {
    render(
      <ImageFrame alt="Tour coastline" aspectRatio="4 / 3" data-testid="frame" src="/tour.jpg" />,
    );

    const image = screen.getByRole('img', { name: 'Tour coastline' });

    fireEvent.load(image);

    expect(screen.getByTestId('frame')).toHaveAttribute('data-image-state', 'loaded');
    expect(image).toHaveAttribute('data-image-state', 'loaded');
  });

  it('hides a failed browser image and renders the caller fallback locally', () => {
    render(
      <ImageFrame
        alt="Tour coastline"
        aspectRatio="4 / 3"
        data-testid="frame"
        fallback={<span>Image unavailable</span>}
        src="/missing.jpg"
      />,
    );

    const image = screen.getByRole('img', { name: 'Tour coastline' });

    fireEvent.error(image);

    expect(screen.getByTestId('frame')).toHaveAttribute('data-image-state', 'failed');
    expect(image).toHaveAttribute('hidden');
    expect(screen.getByText('Image unavailable')).toBeVisible();
  });

  it('preserves an explicit decorative alt without generating text from the filename', () => {
    const { container } = render(
      <ImageFrame alt="" aspectRatio="1 / 1" src="/decorative-filename.jpg" />,
    );

    const image = container.querySelector('img');

    expect(image).toHaveAttribute('alt', '');
  });
});
