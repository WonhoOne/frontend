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

async function completeRequiredConfiguration(page: Page) {
  await page.getByRole('spinbutton', { name: /participants/i }).fill('2');
  await page.getByRole('radio', { name: /4-star hotel/i }).check();
  await page.getByRole('radio', { name: /Premium van \(10\)/i }).check();
  await page.getByRole('radio', { name: /Local restaurant/i }).check();
}

for (const width of [320, 390, 430, 768, 1023]) {
  test(`mobile Configure remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 760 });
    await seedDraft(page);
    await page.goto('/tours/103/configure');

    const mobileSummary = page.getByRole('complementary', { name: 'Mobile trip summary' });
    await expect(mobileSummary).toBeVisible();

    const barGeometry = await mobileSummary.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return {
        position: style.position,
        bottom: Math.round(window.innerHeight - rect.bottom),
        paddingBottom: Number.parseFloat(style.paddingBottom),
      };
    });

    expect(barGeometry.position).toBe('fixed');
    expect(barGeometry.bottom).toBe(0);
    expect(barGeometry.paddingBottom).toBeGreaterThanOrEqual(12);

    const viewport = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

    await completeRequiredConfiguration(page);

    await expect(mobileSummary.getByText('Grand · 3 selections')).toBeVisible();
    await expect(mobileSummary.getByRole('button', { name: 'Review' })).toBeEnabled();

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    const finalRequiredGroup = page
      .getByRole('heading', { name: 'Meal' })
      .locator('xpath=ancestor::section[1]');
    const [groupBox, barBox] = await Promise.all([
      finalRequiredGroup.boundingBox(),
      mobileSummary.boundingBox(),
    ]);

    expect(groupBox).not.toBeNull();
    expect(barBox).not.toBeNull();
    expect((groupBox?.y ?? 0) + (groupBox?.height ?? 0)).toBeLessThanOrEqual(barBox?.y ?? 0);

    const scrollBeforeSheet = await page.evaluate(() => window.scrollY);
    const trigger = mobileSummary.getByRole('button', { name: 'Open trip summary' });
    await trigger.click();

    const sheet = page.getByRole('dialog', { name: 'Trip summary' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText('2 participants')).toBeVisible();
    await expect(sheet.getByText('4-star hotel')).toBeVisible();
    await expect(sheet.getByText('Premium van (10)')).toBeVisible();
    await expect(sheet.getByText('Local restaurant')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBeforeSheet);

    await mobileSummary.getByRole('button', { name: 'Review' }).click();
    await expect(page).toHaveURL('/reservation/review');
  });
}

test('1024px uses the Desktop summary instead of duplicate mobile actions', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  await expect(
    page.getByRole('complementary', { name: 'Current trip configuration' }),
  ).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Mobile trip summary' })).toHaveCount(0);
});

test('reduced motion removes the Configure summary sheet animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 760 });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  await page.getByRole('button', { name: 'Open trip summary' }).click();

  const sheet = page.getByRole('dialog', { name: 'Trip summary' });
  await expect(sheet).toBeVisible();

  expect(await sheet.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
});
