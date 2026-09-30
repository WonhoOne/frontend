import { expect, test } from '@playwright/test';

const fixture = '/tests/e2e/fixtures/tours-states.html';

test.describe('Tours collection states', () => {
  test('loading preserves page geometry without a full-page spinner', async ({ page }) => {
    await page.goto(`${fixture}?state=loading`);

    await expect(
      page.getByRole('heading', { level: 1, name: 'Four ways to travel differently.' }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Loading tour collection' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(page.locator('[data-tour-skeleton-group]')).toHaveCount(4);
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Start with a style. Then make the trip yours.',
      }),
    ).toBeVisible();
  });

  test('empty and fatal mismatch expose explicit local recovery', async ({ page }) => {
    await page.goto(`${fixture}?state=empty`);

    await expect(
      page.getByRole('heading', { name: 'No journeys to show right now.' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByTestId('tours-retry-result')).toHaveText('collection-retry');

    await page.goto(`${fixture}?state=fatal-mismatch`);

    await expect(
      page.getByRole('heading', { name: "We couldn't prepare this collection." }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Retry journeys' }).click();
    await expect(page.getByTestId('tours-retry-result')).toHaveText('collection-retry');
  });

  test('partial failure preserves successful Themes and retries only the failed Theme', async ({
    page,
  }) => {
    await page.goto(`${fixture}?state=partial-failure`);

    await expect(
      page.getByRole('link', { name: 'View Honeymoon Romance · Journey 01 tour details' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'View Golf Challenge · Journey 02 tour details' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Some Parents Healing journeys are unavailable.' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Retry Parents Healing journeys' }).click();

    await expect(page.getByTestId('tours-retry-result')).toHaveText('theme-retry:PARENTS_HEALING');
  });

  test('refreshing and stale signals preserve the successful collection', async ({ page }) => {
    await page.goto(`${fixture}?state=refreshing`);

    await expect(page.getByRole('status').filter({ hasText: 'Updating journeys' })).toBeVisible();
    await expect(page.getByRole('link', { name: /tour details$/ })).toHaveCount(5);

    await page.goto(`${fixture}?state=stale`);

    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'Showing saved journeys while refresh is unavailable' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /tour details$/ })).toHaveCount(5);
  });

  test('an image failure stays local to its Product card', async ({ page }) => {
    await page.goto(`${fixture}?state=image-failure`);

    await expect(page.getByText('Golf Challenge visual unavailable')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /tour details$/ })).toHaveCount(5);
  });

  test('loading and partial failure stay inside 320px and reduced motion removes shimmer', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(`${fixture}?state=loading`);

    expect(
      await page
        .locator('[data-skeleton-variant]')
        .first()
        .evaluate((element) => getComputedStyle(element, '::after').animationName),
    ).toBe('none');

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    ).toBe(false);

    await page.goto(`${fixture}?state=partial-failure`);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    ).toBe(false);
    await expect(
      page.getByRole('button', { name: 'Retry Parents Healing journeys' }),
    ).toBeVisible();
  });
});
