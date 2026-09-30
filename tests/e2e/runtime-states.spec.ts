import { expect, test } from '@playwright/test';

test.describe('App state presentation baseline', () => {
  test('loading, empty, error, offline, and refresh mechanics remain distinct', async ({
    page,
  }) => {
    await page.goto('/tests/e2e/fixtures/states.html');

    const loadingRegion = page.getByRole('region', { name: 'Loading fixture' });

    await expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('fixture-skeleton')).toHaveAttribute('aria-hidden', 'true');

    await expect(
      page.getByRole('heading', { level: 2, name: 'Section unavailable' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Nothing here yet' })).toBeVisible();

    await page.getByRole('button', { name: 'Retry section' }).click();
    await expect(page.getByTestId('retry-result')).toHaveText('retry-requested');

    await expect(
      page.getByRole('status').filter({ hasText: 'Offline fixture status.' }),
    ).toBeVisible();
    await expect(page.locator('[data-refresh-state="refreshing"]')).toContainText(
      'Refreshing fixture',
    );
    await expect(page.locator('[data-refresh-state="stale"]')).toContainText('Stale fixture');
  });

  test('state presentation remains usable at 320px without horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/tests/e2e/fixtures/states.html');

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
    await expect(page.getByRole('button', { name: 'Retry section' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fixture action' })).toBeVisible();
  });
});
