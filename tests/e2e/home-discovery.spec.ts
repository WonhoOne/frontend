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

  test('Home header overlays the hero and becomes solid after the hero threshold', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const header = page.locator('header');
    const hero = page.locator('[data-home-hero]');

    await expect(header).toHaveAttribute('data-header-tone', 'overlay');

    const heroHeight = await hero.evaluate((element) => element.getBoundingClientRect().height);

    await page.evaluate((distance) => window.scrollTo(0, distance), heroHeight);
    await expect(header).toHaveAttribute('data-header-tone', 'solid');

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).toHaveAttribute('data-header-tone', 'overlay');
  });

  test('rapid Theme activation creates one history entry and restores Home scroll context', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const themeLink = page.getByRole('link', { name: 'Explore Golf Challenge theme tours' });

    await themeLink.scrollIntoViewIfNeeded();

    const homeScroll = await page.evaluate(() => window.scrollY);

    expect(homeScroll).toBeGreaterThan(0);

    await themeLink.evaluate((element) => {
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

    await expect(page).toHaveURL(/\/tours\?theme=GOLF_CHALLENGE$/);

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThanOrEqual(Math.max(0, homeScroll - 2));
  });

  test('Home starts with a keyboard-accessible path and a visible hero focus treatment', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Mister World' })).toBeFocused();

    for (const linkName of ['Tours', 'My Trips', 'Login / Account']) {
      await page.keyboard.press('Tab');
      await expect(
        page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
          name: linkName,
          exact: true,
        }),
      ).toBeFocused();
    }

    await page.keyboard.press('Tab');

    const heroAction = page.getByRole('link', { name: 'Explore Theme Tours' });

    await expect(heroAction).toBeFocused();

    const focusStyle = await heroAction.evaluate((element) => {
      const style = getComputedStyle(element);

      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    });

    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);
  });

  test('Home remains usable at the 1280px-at-200%-zoom equivalent', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 720 });
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Theme Tours' })).toBeVisible();

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

    const headerBox = await page.locator('header').boundingBox();

    expect(headerBox).not.toBeNull();
    expect(headerBox?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(64);
  });

  test('Home removes cinematic transforms when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Theme Tours' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Explore Golf Challenge theme tours' }),
    ).toHaveAttribute('href', '/tours?theme=GOLF_CHALLENGE');

    expect(
      await page
        .locator('[data-home-hero-visual]')
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
    expect(
      await page
        .locator('[data-home-hero-copy="headline"]')
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
  });
});
