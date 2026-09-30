import { describe, expect, it } from 'vitest';

import {
  groupTourProductsByTheme,
  readThemeFromSearchParams,
  themeDiscoveryPresentations,
} from '@/features/tour-discovery';
import { tourDiscoveryProductFixtures } from '@/mocks/tourDiscoveryFixtures';

describe('tour discovery contract boundary', () => {
  it('keeps the approved four Theme presentations in stable editorial order', () => {
    expect(themeDiscoveryPresentations.map((item) => item.theme)).toEqual([
      'HONEYMOON_ROMANCE',
      'PARENTS_HEALING',
      'GOLF_CHALLENGE',
      'OUTDOOR_TREKKING',
    ]);
  });

  it('supports one or many TourProducts per Theme instead of assuming 1:1', () => {
    const groups = groupTourProductsByTheme(tourDiscoveryProductFixtures);

    expect(groups.map((group) => group.products.length)).toEqual([1, 1, 2, 1]);
    expect(
      groups
        .find((group) => group.presentation.theme === 'GOLF_CHALLENGE')
        ?.products.map((product) => product.id),
    ).toEqual(['demo-golf-product-a', 'demo-golf-product-b']);
  });

  it('preserves a Theme group even when that Theme currently has zero products', () => {
    const withoutParents = tourDiscoveryProductFixtures.filter(
      (product) => product.theme !== 'PARENTS_HEALING',
    );
    const groups = groupTourProductsByTheme(withoutParents);
    const parentsGroup = groups.find((group) => group.presentation.theme === 'PARENTS_HEALING');

    expect(parentsGroup?.products).toEqual([]);
  });

  it('accepts only approved Theme values from the Tours route search state', () => {
    expect(readThemeFromSearchParams(new URLSearchParams('theme=HONEYMOON_ROMANCE'))).toBe(
      'HONEYMOON_ROMANCE',
    );
    expect(readThemeFromSearchParams(new URLSearchParams('theme=UNKNOWN_THEME'))).toBeNull();
    expect(readThemeFromSearchParams(new URLSearchParams())).toBeNull();
  });

  it('keeps fixture media contract-neutral until local assets are chosen', () => {
    expect(tourDiscoveryProductFixtures.every((product) => product.media.imageSrc === null)).toBe(
      true,
    );
  });
});
