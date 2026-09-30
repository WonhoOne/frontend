import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { ThemeEditorialCard, themeDiscoveryPresentations } from '@/features/tour-discovery';

describe('ThemeEditorialCard', () => {
  it('keeps copy and navigation available when the editorial image fails', () => {
    const basePresentation = themeDiscoveryPresentations[0];
    const presentation = {
      ...basePresentation,
      media: {
        imageSrc: '/missing-home-theme-image.jpg',
        imageAlt: 'Romantic trip preview',
        fallbackLabel: 'Honeymoon Romance visual unavailable',
      },
    };

    render(
      <MemoryRouter>
        <ThemeEditorialCard
          href="/tours?theme=HONEYMOON_ROMANCE"
          presentation={presentation}
          sequence={1}
        />
      </MemoryRouter>,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Romantic trip preview' }));

    expect(screen.getByText('Honeymoon Romance visual unavailable')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Honeymoon Romance' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Explore Honeymoon Romance theme tours' }),
    ).toHaveAttribute('href', '/tours?theme=HONEYMOON_ROMANCE');
  });
});
