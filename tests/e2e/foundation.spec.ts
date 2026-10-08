import { expect, test, type Page } from '@playwright/test';

import { openAuthenticatedReservation } from './support/authenticated-reservation';

const routeCases = [
  ['/', 'A journey made for your moment.'],
  ['/tours', 'Four ways to travel differently.'],
  ['/tours/101', 'Honeymoon Romance · Journey 01'],
  ['/tours/42/configure', 'Configure'],
  ['/reservation/review', 'Reservation Review'],
  ['/reservation/801/success', 'Sign in to view this reservation'],
  ['/reservations/801', 'Sign in to view this reservation'],
  ['/login', 'Login'],
  ['/signup', 'Signup'],
  ['/my-trips', 'Login'],
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

  test('dynamic route parameters resolve Product identity and preserve other route params', async ({
    page,
  }) => {
    await page.goto('/tours/104');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 02' }),
    ).toBeVisible();

    await page.goto('/tours/e2e-tour-id');
    await expect(
      page.getByRole('heading', { level: 1, name: "This journey couldn't be found." }),
    ).toBeVisible();

    await openAuthenticatedReservation(page, '/reservations/801');
    await expect(page.getByText('Reservation #801', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Synthetic Honeymoon' })).toBeVisible();
  });

  test('navigation preserves browser back and forward history', async ({ page }) => {
    await page.goto('/');

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Tours', exact: true })
      .click();
    await expect(page).toHaveURL(/\/tours$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'My Trips', exact: true })
      .click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/tours$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/tours$/);
  });

  test('route runtime resets new scroll and restores history scroll while focusing main', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 500 });
    await page.goto('/');

    await page.evaluate(() => {
      document.body.style.minHeight = '3200px';
      window.scrollTo(0, 1200);
    });

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1100);
    const homeScroll = await page.evaluate(() => window.scrollY);

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Tours', exact: true })
      .evaluate((element) => (element as HTMLAnchorElement).click());

    await expect(page).toHaveURL(/\/tours$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);

    await page.evaluate(() => {
      window.scrollTo(0, 700);
    });

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(650);
    const toursScroll = await page.evaluate(() => window.scrollY);

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'My Trips', exact: true })
      .evaluate((element) => (element as HTMLAnchorElement).click());

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);

    await page.goBack();
    await expect(page).toHaveURL(/\/tours$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThanOrEqual(toursScroll - 1);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThanOrEqual(homeScroll - 1);

    await page.goForward();
    await expect(page).toHaveURL(/\/tours$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThanOrEqual(toursScroll - 1);
  });

  test('unknown route renders application Not Found recovery', async ({ page }) => {
    await page.goto('/not-a-customer-route');

    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();

    const recovery = page.getByRole('navigation', { name: 'Not found recovery' });

    await expect(recovery.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(recovery.getByRole('link', { name: 'Tours' })).toHaveAttribute('href', '/tours');
  });
});

test.describe('Foundation keyboard and focus baseline', () => {
  test('skip link moves keyboard focus to the main landmark', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });

    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');

    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('Dialog contains focus and returns it to the opener', async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/overlays.html');

    const opener = page.getByRole('button', { name: 'Open dialog' });
    await opener.click();

    const dialog = page.getByRole('dialog', { name: 'E2E dialog' });

    await expect(dialog).toBeVisible();
    await expect
      .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);

    for (let index = 0; index < 6; index += 1) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
        true,
      );
    }

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('BottomSheet contains focus and returns it to the opener', async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/overlays.html');

    const opener = page.getByRole('button', { name: 'Open sheet' });
    await opener.click();

    const sheet = page.getByRole('dialog', { name: 'E2E sheet' });

    await expect(sheet).toBeVisible();
    await expect
      .poll(() => sheet.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);

    for (let index = 0; index < 6; index += 1) {
      await page.keyboard.press('Tab');
      expect(await sheet.evaluate((element) => element.contains(document.activeElement))).toBe(
        true,
      );
    }

    await page.keyboard.press('Escape');

    await expect(sheet).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe('Foundation responsive baseline', () => {
  for (const width of [320, 390, 640, 768, 1280]) {
    test(`App chrome and PageContainer stay usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const viewport = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

      const headingBox = await page
        .getByRole('heading', { level: 1, name: 'A journey made for your moment.' })
        .boundingBox();

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

  for (const width of [320, 390, 640, 768, 1280]) {
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

  test('640px reflow remains usable as the 1280px-at-200%-zoom equivalent', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 720 });
    await page.goto('/tours/42/configure');

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Configure' })).toBeVisible();
  });
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
