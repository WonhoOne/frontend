import { expect, test } from '@playwright/test';

test.describe('Tour Detail core editorial', () => {
  test('renders a direct TourProduct URL without requiring Discovery navigation state', async ({
    page,
  }) => {
    await page.goto('/tours/demo-honeymoon-product-a');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Honeymoon Romance · Journey 01' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'What this Theme brings with it.' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3);
    await expect(
      page.getByRole('link', { name: '← Back to Honeymoon Romance journeys' }),
    ).toHaveAttribute('href', '/tours?theme=HONEYMOON_ROMANCE');
  });

  test('keeps two Golf TourProducts as distinct detail routes', async ({ page }) => {
    await page.goto('/tours/demo-golf-product-a');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();

    await page.goto('/tours/demo-golf-product-b');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 02' }),
    ).toBeVisible();
    await expect(page.getByText('Golf Challenge', { exact: true }).first()).toBeVisible();
  });

  test('renders an invalid TourProduct identity as branded not found', async ({ page }) => {
    await page.goto('/tours/not-a-real-tour-product');

    await expect(
      page.getByRole('heading', { level: 1, name: "This journey couldn't be found." }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse tours' })).toHaveAttribute(
      'href',
      '/tours',
    );
  });

  for (const width of [320, 390, 768, 1280]) {
    test(`keeps the core detail readable without horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/tours/demo-golf-product-a');

      await expect(
        page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
      ).toBeVisible();

      const viewport = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
    });
  }
});
