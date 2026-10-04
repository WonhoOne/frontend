import { expect, test } from '@playwright/test';

test.describe('Tour Detail core editorial', () => {
  test('renders a direct TourProduct URL without requiring Discovery navigation state', async ({
    page,
  }) => {
    await page.goto('/tours/101');

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
    await page.goto('/tours/103');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();

    await page.goto('/tours/104');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 02' }),
    ).toBeVisible();
    await expect(page.getByText('Golf Challenge', { exact: true }).first()).toBeVisible();
  });

  test('mirrors Theme Style restrictions without preselecting a Style', async ({ page }) => {
    await page.goto('/tours/101');

    const honeymoonStyles = page.getByRole('group', { name: 'Tour style options' });

    await expect(honeymoonStyles.getByRole('radio')).toHaveCount(2);
    await expect(page.getByRole('radio', { name: /Classic/ })).toHaveCount(0);
    await expect(page.getByRole('radio', { name: /Grand/ })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Premium/ })).not.toBeChecked();

    await page.goto('/tours/103');

    const golfStyles = page.getByRole('group', { name: 'Tour style options' });

    await expect(golfStyles.getByRole('radio')).toHaveCount(3);
    await expect(page.getByRole('radio', { name: /Classic/ })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Grand/ })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Premium/ })).not.toBeChecked();
  });

  test('supports native keyboard Style selection and visible focus', async ({ page }) => {
    await page.goto('/tours/103');

    const classic = page.getByRole('radio', { name: /Classic/ });
    const grand = page.getByRole('radio', { name: /Grand/ });

    await classic.focus();
    await expect(classic).toBeFocused();

    await page.keyboard.press('Space');
    await expect(classic).toBeChecked();

    await page.keyboard.press('ArrowRight');
    await expect(grand).toBeChecked();
    await expect(classic).not.toBeChecked();

    const focusStyle = await grand.evaluate((element) => {
      const card = element.closest('[data-selected="true"]');

      if (!(card instanceof HTMLElement)) {
        return null;
      }

      const style = getComputedStyle(card);

      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
      };
    });

    expect(focusStyle).not.toBeNull();
    expect(focusStyle?.outlineStyle).not.toBe('none');
    expect(focusStyle?.outlineWidth ?? 0).toBeGreaterThanOrEqual(2);
  });

  test('removes OptionCard transition motion when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tours/103');

    const classic = page.getByRole('radio', { name: /Classic/ });

    await classic.click();

    const transitionDuration = await classic.evaluate((element) => {
      const card = element.closest('[data-selected="true"]');

      return card instanceof HTMLElement ? getComputedStyle(card).transitionDuration : null;
    });

    expect(transitionDuration).toBe('0s');
  });

  test('selects an available schedule but keeps unavailable schedules disabled', async ({
    page,
  }) => {
    await page.goto('/tours/103');

    const available = page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ });
    const unavailable = page.getByRole('radio', { name: /2027-04-10 – 2027-04-14/ });

    await expect(available).not.toBeChecked();
    await expect(unavailable).toBeDisabled();

    await available.click();

    await expect(available).toBeChecked();
    await expect(unavailable).not.toBeChecked();
  });

  test('renders Honeymoon recruitment presentation from approved wording', async ({ page }) => {
    await page.goto('/tours/101');

    await expect(
      page.getByText('1 / 2 couples/teams · Not confirmed'),
    ).toBeVisible();
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
      await page.goto('/tours/103');

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
