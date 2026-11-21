import { expect, it } from 'vitest';
import { adaptTourProductDetailDto } from '@/features/tour-detail';
import { adaptTourProductDto } from '@/features/tour-discovery';
import { themeDiscoveryPresentations } from '@/features/tour-discovery/themeDiscoveryPresentations';
import { themePhotos } from '@/shared/media/themePhotos';

const themes = Object.keys(themePhotos) as (keyof typeof themePhotos)[];

it('gives every Theme a distinct photo with descriptive alt text', () => {
  expect(new Set(themes.map((theme) => themePhotos[theme].src)).size).toBe(4);
  for (const theme of themes) expect(themePhotos[theme].alt.length).toBeGreaterThan(10);
});

it.each(themes)('uses the %s photo on Discovery cards and the Detail hero', (theme) => {
  const dto = {
    id: 7,
    theme,
    name: 'Any product',
    description: 'Test',
    availableStyles: ['GRAND' as const],
    stylePrices: [{ style: 'GRAND' as const, amount: 1, currency: 'KRW' as const }],
  };
  const presentation = themeDiscoveryPresentations.find((item) => item.theme === theme);
  expect(presentation?.media).toMatchObject({ imageSrc: themePhotos[theme].src });
  expect(adaptTourProductDto(dto).media).toMatchObject({
    imageSrc: themePhotos[theme].src,
    imageAlt: themePhotos[theme].alt,
  });
  const detail = adaptTourProductDetailDto(dto);
  expect(detail.heroMedia).toMatchObject({
    imageSrc: themePhotos[theme].src,
    imageAlt: themePhotos[theme].alt,
  });
  // Story and included-experience slots keep their labelled placeholders.
  expect(detail.storyMedia.imageSrc).toBeNull();
});
