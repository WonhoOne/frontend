import { expect, test } from '@playwright/test';

const canonicalWidths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1728] as const;

const themeLinks = [
  ['Honeymoon Romance', 'HONEYMOON_ROMANCE'],
  ['Parents Healing', 'PARENTS_HEALING'],
  ['Golf Challenge', 'GOLF_CHALLENGE'],
  ['Outdoor Trekking', 'OUTDOOR_TREKKING'],
] as const;

test.describe('Home discovery core', () => {
  for (const width of canonicalWidths) {
    test(`Home keeps its core layout inside the ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      await expect(
        page.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
      ).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

      for (const [label, theme] of themeLinks) {
        const link = page.getByRole('link', { name: `Explore ${label} theme tours` });

        await expect(link).toHaveAttribute('href', `/tours?theme=${theme}`);
        await link.scrollIntoViewIfNeeded();

        const bounds = await link.boundingBox();

        expect(bounds).not.toBeNull();
        expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
        expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width + 1);
      }

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );

      expect(hasHorizontalOverflow).toBe(false);
    });
  }

  test('Home starts with a keyboard-accessible skip path and global navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Mister World' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Tours' }),
    ).toBeFocused();
  });

  test('Home remains usable with reduced motion requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Theme Tours' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Explore Golf Challenge theme tours' }),
    ).toHaveAttribute('href', '/tours?theme=GOLF_CHALLENGE');
  });
});
