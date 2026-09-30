import { expect, test } from '@playwright/test';

const fixture = '/tests/e2e/fixtures/tour-schedule-states.html';

test.describe('Tour Detail schedule states', () => {
  test('schedule loading preserves Tour core and uses local skeleton geometry', async ({
    page,
  }) => {
    await page.goto(`${fixture}?state=loading`);

    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Loading tour schedules' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(page.getByTestId('tour-schedule-skeleton')).toBeVisible();
  });

  test('empty and error states stay local and expose schedule retry', async ({ page }) => {
    await page.goto(`${fixture}?state=empty`);

    await expect(
      page.getByRole('heading', { name: 'No schedules are available yet.' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Retry schedules' }).click();
    await expect(page.getByTestId('schedule-retry-result')).toHaveText('schedule-retry');

    await page.goto(`${fixture}?state=network-error`);

    await expect(page.getByRole('heading', { name: "We couldn't load schedules." })).toBeVisible();
    await page.getByRole('button', { name: 'Retry schedules' }).click();
    await expect(page.getByTestId('schedule-retry-result')).toHaveText('schedule-retry');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();
  });

  test('partial error preserves available schedule choices', async ({ page }) => {
    await page.goto(`${fixture}?state=partial-error`);

    await expect(
      page.getByRole('heading', { name: 'Some schedule information is unavailable.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Tour schedule options' }).getByRole('radio'),
    ).toHaveCount(2);
    await expect(page.getByRole('radio', { name: /Schedule preview A/ })).toBeEnabled();
    await expect(page.getByRole('radio', { name: /Schedule preview B/ })).toBeDisabled();

    await page.getByRole('button', { name: 'Retry schedule data' }).click();
    await expect(page.getByTestId('schedule-retry-result')).toHaveText('schedule-retry');
  });

  test('refreshing and stale states preserve schedule content', async ({ page }) => {
    await page.goto(`${fixture}?state=refreshing`);

    await expect(page.getByRole('status').filter({ hasText: 'Updating schedules' })).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Tour schedule options' }).getByRole('radio'),
    ).toHaveCount(2);

    await page.goto(`${fixture}?state=stale`);

    await expect(
      page
        .getByRole('status')
        .filter({ hasText: 'Showing saved schedules while refresh is unavailable' }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Tour schedule options' }).getByRole('radio'),
    ).toHaveCount(2);
  });

  test('unavailable schedules are disabled and none are selected', async ({ page }) => {
    await page.goto(`${fixture}?state=unavailable`);

    const radios = page.getByRole('group', { name: 'Tour schedule options' }).getByRole('radio');

    await expect(radios).toHaveCount(2);
    await expect(radios.nth(0)).toBeDisabled();
    await expect(radios.nth(1)).toBeDisabled();
    await expect(radios.nth(0)).not.toBeChecked();
    await expect(radios.nth(1)).not.toBeChecked();
    await expect(page.getByText('No schedule is currently selectable.')).toBeVisible();
  });

  test('schedule states stay inside 320px and loading shimmer respects reduced motion', async ({
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

    await page.goto(`${fixture}?state=partial-error`);

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    ).toBe(false);
  });
});
