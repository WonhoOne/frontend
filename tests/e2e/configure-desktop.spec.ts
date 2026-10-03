import { expect, test, type Page } from '@playwright/test';

const draft = {
  schemaVersion: 1,
  tourProductId: 'tour-42',
  tourScheduleId: 'schedule-7',
  tourStyle: 'GRAND',
  participantCount: null,
  configuration: {
    hotelSelectionKey: null,
    transportSelectionKey: null,
    mealSelectionKey: null,
    extraSelectionKeys: [],
  },
  updatedAt: 1,
};

async function seedDraft(page: Page) {
  await page.addInitScript((storedDraft: typeof draft) => {
    window.sessionStorage.setItem('mister-world:reservation-draft:v1', JSON.stringify(storedDraft));
  }, draft);
}

for (const width of [1024, 1280]) {
  test(`desktop Configure remains coherent at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await seedDraft(page);
    await page.goto('/tours/42/configure');

    await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();

    const summary = page.getByRole('complementary', { name: 'Current trip configuration' });
    await expect(summary).toBeVisible();

    const summaryPosition = await summary.evaluate((element) => {
      const column = element.parentElement;
      return column === null ? null : getComputedStyle(column).position;
    });
    expect(summaryPosition).toBe('sticky');

    await page.getByRole('spinbutton', { name: /participants/i }).fill('2');
    await page.getByRole('radio', { name: /Fixture hotel A/i }).check();
    await page.getByRole('radio', { name: /Fixture transport B/i }).check();
    await page.getByRole('radio', { name: /Fixture meal A/i }).check();

    await expect(summary.getByText('2 participants')).toBeVisible();
    await expect(summary.getByText('Fixture hotel A')).toBeVisible();
    await expect(summary.getByText('Fixture transport B')).toBeVisible();
    await expect(summary.getByText('Fixture meal A')).toBeVisible();

    const review = page.getByRole('button', { name: 'Review trip' });
    await expect(review).toBeEnabled();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);

    await review.click();
    await expect(page).toHaveURL('/reservation/review');
  });
}
