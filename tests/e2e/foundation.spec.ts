import { expect, test, type Page } from '@playwright/test';

const routeCases = [
  ['/', 'Home'],
  ['/tours', 'Tours'],
  ['/tours/e2e-tour-id', 'Tour Detail'],
  ['/tours/e2e-tour-id/configure', 'Configure'],
  ['/reservation/review', 'Reservation Review'],
  ['/reservation/e2e-reservation-id/success', 'Reservation Success'],
  ['/reservations/e2e-reservation-id', 'Reservation Detail'],
  ['/login', 'Login'],
  ['/signup', 'Signup'],
  ['/my-trips', 'My Trips'],
] as const;

function collectPageErrors(page: Page) {
  const pageErrors: string[] = [];

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  return pageErrors;
}

test.describe('Foundation routes', () => {
  for (const [path, heading] of routeCases) {
    test(`${path} mounts ${heading}`, async ({ page }) => {
      const pageErrors = collectPageErrors(page);

      await page.goto(path);

      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

      expect(pageErrors).toEqual([]);
    });
  }

  test('dynamic route parameters are matched', async ({ page }) => {
    await page.goto('/tours/e2e-tour-id');
    await expect(page.getByText('e2e-tour-id', { exact: true })).toBeVisible();

    await page.goto('/reservations/e2e-reservation-id');
    await expect(page.getByText('e2e-reservation-id', { exact: true })).toBeVisible();
  });

  test('unknown route renders application Not Found recovery', async ({ page }) => {
    await page.goto('/not-a-customer-route');

    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();

    const recovery = page.getByRole('navigation', { name: 'Not found recovery' });

    await expect(recovery.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(recovery.getByRole('link', { name: 'Tours' })).toHaveAttribute('href', '/tours');
  });
});

test.describe('Foundation responsive baseline', () => {
  for (const width of [390, 1280]) {
    test(`App chrome and PageContainer stay usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const viewport = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

      const headingBox = await page.getByRole('heading', { level: 1, name: 'Home' }).boundingBox();

      expect(headingBox).not.toBeNull();
      expect(headingBox?.x ?? 0).toBeGreaterThan(0);

      const headerLinks = page.locator('header a');

      for (let index = 0; index < (await headerLinks.count()); index += 1) {
        const box = await headerLinks.nth(index).boundingBox();

        expect(box).not.toBeNull();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  }

  for (const width of [390, 1280]) {
    test(`Dialog and BottomSheet stay inside the viewport at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await page.goto('/tests/e2e/fixtures/overlays.html');

      await page.getByRole('button', { name: 'Open dialog' }).click();

      const dialog = page.getByRole('dialog', { name: 'E2E dialog' });
      await expect(dialog).toBeVisible();

      const dialogBox = await dialog.boundingBox();

      expect(dialogBox).not.toBeNull();
      expect(dialogBox?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((dialogBox?.x ?? 0) + (dialogBox?.width ?? 0)).toBeLessThanOrEqual(width);
      expect(dialogBox?.y ?? -1).toBeGreaterThanOrEqual(0);
      expect((dialogBox?.y ?? 0) + (dialogBox?.height ?? 0)).toBeLessThanOrEqual(720);

      await page.getByRole('button', { name: 'Close dialog' }).click();
      await expect(dialog).toBeHidden();

      await page.getByRole('button', { name: 'Open sheet' }).click();

      const sheet = page.getByRole('dialog', { name: 'E2E sheet' });
      await expect(sheet).toBeVisible();

      await expect
        .poll(async () => {
          const box = await sheet.boundingBox();

          return box === null ? Number.POSITIVE_INFINITY : box.y + box.height;
        })
        .toBeLessThanOrEqual(720);

      const sheetBox = await sheet.boundingBox();

      expect(sheetBox).not.toBeNull();
      expect(sheetBox?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((sheetBox?.x ?? 0) + (sheetBox?.width ?? 0)).toBeLessThanOrEqual(width);
      expect(sheetBox?.y ?? -1).toBeGreaterThanOrEqual(0);
    });
  }
});

test('reduced motion removes Foundation overlay motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/tests/e2e/fixtures/overlays.html');

  await page.getByRole('button', { name: 'Open dialog' }).click();

  const dialog = page.getByRole('dialog', { name: 'E2E dialog' });

  await expect(dialog).toBeVisible();

  expect(await dialog.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');

  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Open sheet' }).click();

  const sheet = page.getByRole('dialog', { name: 'E2E sheet' });

  await expect(sheet).toBeVisible();

  expect(await sheet.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
});
