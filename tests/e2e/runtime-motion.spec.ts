import { expect, test } from '@playwright/test';

test.describe('Route motion runtime', () => {
  test('direct entry, PUSH, Back, and Forward use the expected restrained direction', async ({
    page,
  }) => {
    await page.goto('/');

    const motionSurface = page.locator('[data-route-motion-direction]');

    await expect(motionSurface).toHaveAttribute('data-route-motion-direction', 'entry');
    expect(
      await motionSurface.evaluate((element) => getComputedStyle(element).animationName),
    ).toContain('route-entry');

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Tours', exact: true })
      .click();
    await expect(page).toHaveURL(/\/tours$/);
    await expect(motionSurface).toHaveAttribute('data-route-motion-direction', 'forward');
    expect(
      await motionSurface.evaluate((element) => getComputedStyle(element).animationName),
    ).toContain('route-forward');

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'My Trips', exact: true })
      .click();
    await expect(page).toHaveURL(/\/my-trips$/);
    await expect(motionSurface).toHaveAttribute('data-route-motion-direction', 'forward');

    await page.goBack();
    await expect(page).toHaveURL(/\/tours$/);
    await expect(motionSurface).toHaveAttribute('data-route-motion-direction', 'back');
    expect(
      await motionSurface.evaluate((element) => getComputedStyle(element).animationName),
    ).toContain('route-back');

    await page.goForward();
    await expect(page).toHaveURL(/\/my-trips$/);
    await expect(motionSurface).toHaveAttribute('data-route-motion-direction', 'forward');
  });

  test('rapid navigation leaves only the latest route and a single motion surface', async ({
    page,
  }) => {
    await page.goto('/');

    await page.evaluate(() => {
      const toursLink = document.querySelector<HTMLAnchorElement>('a[href="/tours"]');
      const tripsLink = document.querySelector<HTMLAnchorElement>('a[href="/my-trips"]');

      toursLink?.click();
      tripsLink?.click();
    });

    await expect(page).toHaveURL(/\/my-trips$/);
    await expect(page.getByRole('heading', { level: 1, name: 'My Trips' })).toBeVisible();
    await expect(page.locator('[data-route-motion-key]')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toHaveCount(0);
  });

  test('reduced motion removes route transforms while preserving navigation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const motionSurface = page.locator('[data-route-motion-direction]');

    expect(await motionSurface.evaluate((element) => getComputedStyle(element).animationName)).toBe(
      'none',
    );

    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Tours', exact: true })
      .click();

    await expect(page).toHaveURL(/\/tours$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toBeVisible();
    expect(await motionSurface.evaluate((element) => getComputedStyle(element).animationName)).toBe(
      'none',
    );
    expect(await motionSurface.evaluate((element) => getComputedStyle(element).transform)).toBe(
      'none',
    );
  });
});

test.describe('Shared reveal runtime', () => {
  test('section and image helpers reveal once on viewport entry', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto('/tests/e2e/fixtures/motion.html');

    const section = page.getByTestId('section-reveal').locator('..');
    const image = page.getByTestId('image-reveal').locator('..');

    await expect(section).toHaveAttribute('data-revealed', 'false');
    await expect(image).toHaveAttribute('data-revealed', 'false');

    await page.getByTestId('section-reveal').scrollIntoViewIfNeeded();
    await expect(section).toHaveAttribute('data-revealed', 'true');

    await page.getByTestId('image-reveal').scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('data-revealed', 'true');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByTestId('section-reveal').scrollIntoViewIfNeeded();

    await expect(section).toHaveAttribute('data-revealed', 'true');
    await expect(image).toHaveAttribute('data-revealed', 'true');
  });

  test('reduced motion makes unrevealed helpers immediately visible without transforms', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.goto('/tests/e2e/fixtures/motion.html');

    const section = page.getByTestId('section-reveal').locator('..');
    const image = page.getByTestId('image-reveal').locator('..');

    for (const target of [section, image]) {
      expect(await target.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
      expect(await target.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
      expect(await target.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
        '0s',
      );
    }
  });
});

test('Dialog and BottomSheet retain tokenized App Runtime motion', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/overlays.html');

  await page.getByRole('button', { name: 'Open dialog' }).click();

  const dialog = page.getByRole('dialog', { name: 'E2E dialog' });

  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => getComputedStyle(element).animationName)).toContain(
    'dialog-content-in',
  );

  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Open sheet' }).click();

  const sheet = page.getByRole('dialog', { name: 'E2E sheet' });

  await expect(sheet).toBeVisible();
  expect(await sheet.evaluate((element) => getComputedStyle(element).animationName)).toContain(
    'bottom-sheet-in',
  );
});
