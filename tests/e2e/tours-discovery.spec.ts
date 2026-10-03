import { expect, test } from '@playwright/test';

const canonicalWidths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1728] as const;

test.describe('Tours discovery collection', () => {
  for (const width of canonicalWidths) {
    test(`Tours stays usable inside the ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/tours');

      await expect(
        page.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
      ).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

      for (const theme of [
        'Honeymoon Romance',
        'Parents Healing',
        'Golf Challenge',
        'Outdoor Trekking',
      ]) {
        await expect(page.getByRole('heading', { level: 2, name: theme })).toBeVisible();
      }

      const productLinks = page.getByRole('link', { name: /tour details$/ });

      await expect(productLinks).toHaveCount(5);

      for (let index = 0; index < 5; index += 1) {
        const link = productLinks.nth(index);

        await link.scrollIntoViewIfNeeded();

        const bounds = await link.boundingBox();

        expect(bounds).not.toBeNull();
        expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0);
        expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width + 1);
      }

      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
      ).toBe(false);
    });
  }

  test('Home Theme focus leads to two distinct Golf TourProducts and real detail identities', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Explore Golf Challenge theme tours' }).click();

    await expect(page).toHaveURL(/\/tours\?theme=GOLF_CHALLENGE$/);

    const golfSection = page.locator('[data-theme="GOLF_CHALLENGE"]');

    await expect(golfSection).toHaveAttribute('data-focused-theme', 'true');
    await expect(golfSection.getByText('Your selected theme')).toBeVisible();

    const firstGolfProduct = golfSection.getByRole('link', {
      name: 'View Golf Challenge · Journey 01 tour details',
    });
    const secondGolfProduct = golfSection.getByRole('link', {
      name: 'View Golf Challenge · Journey 02 tour details',
    });

    await expect(firstGolfProduct).toHaveAttribute('href', '/tours/103');
    await expect(secondGolfProduct).toHaveAttribute('href', '/tours/104');

    await firstGolfProduct.click();
    await expect(page).toHaveURL(/\/tours\/demo-golf-product-a$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/tours\?theme=GOLF_CHALLENGE$/);

    await secondGolfProduct.click();
    await expect(page).toHaveURL(/\/tours\/demo-golf-product-b$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 02' }),
    ).toBeVisible();
  });

  test('rapid duplicate activation creates only one TourProduct history entry', async ({
    page,
  }) => {
    await page.goto('/tours');

    const product = page.getByRole('link', {
      name: 'View Golf Challenge · Journey 01 tour details',
    });

    await product.evaluate((element) => {
      const dispatchPrimaryClick = () =>
        element.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0,
          }),
        );

      dispatchPrimaryClick();
      dispatchPrimaryClick();
    });

    await expect(page).toHaveURL(/\/tours\/demo-golf-product-a$/);

    await page.goBack();

    await expect(page).toHaveURL(/\/tours$/);
  });

  test('Tours begins with a logical keyboard path and visible Product focus treatment', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/tours');

    for (const linkName of [
      'Skip to main content',
      'Mister World',
      'Tours',
      'My Trips',
      'Login / Account',
    ]) {
      await page.keyboard.press('Tab');
      await expect(
        linkName === 'Skip to main content' || linkName === 'Mister World'
          ? page.getByRole('link', { name: linkName })
          : page
              .getByRole('navigation', { name: 'Primary' })
              .getByRole('link', { name: linkName, exact: true }),
      ).toBeFocused();
    }

    await page.keyboard.press('Tab');

    const firstProduct = page.getByRole('link', {
      name: 'View Honeymoon Romance · Journey 01 tour details',
    });

    await expect(firstProduct).toBeFocused();

    const focusStyle = await firstProduct.evaluate((element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();

      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
        width: bounds.width,
        height: bounds.height,
      };
    });

    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(focusStyle.width).toBeGreaterThanOrEqual(44);
    expect(focusStyle.height).toBeGreaterThanOrEqual(44);
  });

  test('Tours remains usable at the 1280px-at-200%-zoom equivalent', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 720 });
    await page.goto('/tours');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toBeVisible();

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
  });

  test('Tours removes card transition motion when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tours');

    const product = page.getByRole('link', {
      name: 'View Honeymoon Romance · Journey 01 tour details',
    });

    expect(await product.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
      '0s',
    );
  });
});
