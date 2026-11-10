import { expect, test, type Page } from '@playwright/test';

const draft = {
  schemaVersion: 1,
  tourProductId: '103',
  tourScheduleId: '1301',
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
    await page.goto('/tours/103/configure');

    await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();

    const summary = page.getByRole('complementary', { name: 'Current trip configuration' });
    await expect(summary).toBeVisible();

    const summaryPosition = await summary.evaluate((element) => {
      const column = element.parentElement;
      return column === null ? null : getComputedStyle(column).position;
    });
    expect(summaryPosition).toBe('sticky');

    await page.getByRole('spinbutton', { name: /participants/i }).fill('2');
    await page.getByRole('radio', { name: /4-star hotel/i }).check();
    await page.getByRole('radio', { name: /Premium van \(10\)/i }).check();
    await page.getByRole('radio', { name: /Local restaurant/i }).check();

    await expect(summary.getByText('2 participants')).toBeVisible();
    await expect(summary.getByText('4-star hotel')).toBeVisible();
    await expect(summary.getByText('Premium van (10)')).toBeVisible();
    await expect(summary.getByText('Local restaurant')).toBeVisible();

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

// UML 감사 D-01 (frontend#66): BR-20 차량 정원 ≥ 인원. 어느 순서로 골라도 Review 전에 막고,
// 선택을 자동으로 바꾸지 않으며, 사용자가 고치면 다시 진행할 수 있다.
test('desktop Configure blocks Review when travellers exceed the transport capacity', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  const review = page.getByRole('button', { name: 'Review trip' });
  const capacityAlert = page
    .getByRole('alert')
    .filter({ hasText: 'seats up to 2 travellers, but 4 are traveling' });

  await page.getByRole('spinbutton', { name: /participants/i }).fill('4');
  await page.getByRole('radio', { name: /4-star hotel/i }).check();
  await page.getByRole('radio', { name: /Premium van \(10\)/i }).check();
  await page.getByRole('radio', { name: /Local restaurant/i }).check();
  await expect(review).toBeEnabled();

  // 순서 1: 4명 + 밴 → 2인승으로 변경
  await page.getByRole('radio', { name: /Private luxury car \(2\)/i }).check();
  await expect(capacityAlert).toBeVisible();
  await expect(review).toBeDisabled();
  await expect(page.getByRole('radio', { name: /Private luxury car \(2\)/i })).toBeChecked();

  // 순서 2: 2명 + 2인승에서 인원을 4명으로 늘림
  await page.getByRole('spinbutton', { name: /participants/i }).fill('2');
  await expect(capacityAlert).toBeHidden();
  await expect(review).toBeEnabled();
  await page.getByRole('spinbutton', { name: /participants/i }).fill('4');
  await expect(capacityAlert).toBeVisible();
  await expect(review).toBeDisabled();

  // 사용자가 직접 고치면 Review로 진행한다.
  await page.getByRole('radio', { name: /Premium van \(10\)/i }).check();
  await expect(capacityAlert).toBeHidden();
  await review.click();
  await expect(page).toHaveURL('/reservation/review');
});
