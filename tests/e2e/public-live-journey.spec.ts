import { expect, test } from '@playwright/test';

test('S01 → S04 public live journey stays on the real public-read boundary', async ({ page }) => {
  const publicReads = new Set<string>();

  page.on('request', (request) => {
    const url = new URL(request.url());

    if (url.pathname.startsWith('/api/v1/tours') || url.pathname === '/api/v1/tour-schedules') {
      publicReads.add(`${url.pathname}${url.search}`);
    }
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'A journey made for your moment.' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Explore Golf Challenge theme tours' }).click();

  await expect(page).toHaveURL(/\/tours\?theme=GOLF_CHALLENGE$/);
  await expect(
    page.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
  ).toHaveAttribute('href', '/tours/103');

  await page
    .getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' })
    .click();

  await expect(page).toHaveURL(/\/tours\/103$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
  ).toBeVisible();

  await page.getByRole('radio', { name: /Grand/ }).click();
  await page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ }).click();

  const configure = page.getByRole('button', { name: 'Configure this trip' });
  await expect(configure).toBeEnabled();
  await configure.click();

  await expect(page).toHaveURL(/\/tours\/103\/configure$/);
  await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();
  await expect(page.getByText(/Golf Challenge · Grand · 2027-03-10 – 2027-03-14/)).toBeVisible();
  await expect(page.getByText(/₩1,800,000 per participant/)).toBeVisible();

  expect([...publicReads]).toEqual(
    expect.arrayContaining([
      '/api/v1/tours',
      '/api/v1/tours/103',
      '/api/v1/tour-schedules?tourId=103',
    ]),
  );

  await expect(page.locator('body')).not.toContainText('__F1_PUBLIC_READ_MOCK_ONLY__');
});
