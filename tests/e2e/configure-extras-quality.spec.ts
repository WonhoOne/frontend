import { expect, test, type Locator, type Page } from '@playwright/test';

const storageKey = 'mister-world:reservation-draft:v1';
const extrasFixture = '/tests/e2e/fixtures/configure-states.html';

const draft = {
  schemaVersion: 1,
  tourProductId: '103',
  tourScheduleId: '1301',
  tourStyle: 'GRAND',
  participantCount: 2,
  configuration: {
    hotelSelectionKey: 'HOTEL_4_STAR',
    transportSelectionKey: 'PREMIUM_VAN_10',
    mealSelectionKey: 'LOCAL_RESTAURANT',
    extraSelectionKeys: ['COFFEE'],
  },
  updatedAt: 1,
};

async function seedDraft(page: Page) {
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem(key) === null) {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    },
    { key: storageKey, value: draft },
  );
}

async function readExtras(page: Page) {
  return page.evaluate((key) => {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return null;
    const value = JSON.parse(raw) as { configuration: { extraSelectionKeys: string[] } };
    return value.configuration.extraSelectionKeys;
  }, storageKey);
}

async function tabUntilFocused(page: Page, target: Locator) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await target.evaluate((element) => document.activeElement === element)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

for (const width of [320, 390, 768, 1023, 1024, 1280]) {
  test(`Extras selection and summary stay usable without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 760 });
    await seedDraft(page);
    await page.goto('/tours/103/configure');

    const group = page.getByRole('group', { name: 'Extras' });
    await expect(group).toBeVisible();
    const champagne = group.getByRole('checkbox', { name: /Champagne/i });
    const coffee = group.getByRole('checkbox', { name: /Coffee/i });
    await expect(champagne).not.toBeChecked();
    await expect(coffee).toBeChecked();

    for (const checkbox of [champagne, coffee]) {
      const label = checkbox.locator('xpath=ancestor::label[1]');
      const rect = await label.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await champagne.check();
    await expect(champagne).toBeChecked();
    await expect(coffee).toBeChecked();
    await expect.poll(() => readExtras(page)).toEqual(['CHAMPAGNE', 'COFFEE']);

    if (width < 1024) {
      const bar = page.getByRole('complementary', { name: 'Mobile trip summary' });
      await expect(bar.getByText('Grand · 5 selections')).toBeVisible();
      const trigger = bar.getByRole('button', { name: 'Open trip summary' });
      await trigger.click();
      const sheet = page.getByRole('dialog', { name: 'Trip summary' });
      await expect(sheet).toBeVisible();
      await expect(sheet.getByText('Champagne, Coffee')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      await expect(trigger).toBeFocused();
    } else {
      await expect(
        page
          .getByRole('complementary', { name: 'Current trip configuration' })
          .getByText('Champagne, Coffee'),
      ).toBeVisible();
      await expect(page.getByRole('complementary', { name: 'Mobile trip summary' })).toHaveCount(0);
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    ).toBe(false);
  });
}

test('Extras native checkboxes work by keyboard and persist through reload', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  const champagne = page.getByRole('checkbox', { name: /Champagne/i });
  const coffee = page.getByRole('checkbox', { name: /Coffee/i });

  await tabUntilFocused(page, champagne);
  await page.keyboard.press('Space');
  await expect(champagne).toBeChecked();
  await expect.poll(() => readExtras(page)).toEqual(['CHAMPAGNE', 'COFFEE']);

  await tabUntilFocused(page, coffee);
  await page.keyboard.press('Space');
  await expect(coffee).not.toBeChecked();
  await expect.poll(() => readExtras(page)).toEqual(['CHAMPAGNE']);

  await page.reload();
  await expect(page.getByRole('group', { name: 'Extras' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /Champagne/i })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /Coffee/i })).not.toBeChecked();
  await expect.poll(() => readExtras(page)).toEqual(['CHAMPAGNE']);
});

test('200% zoom-equivalent viewport preserves Extras and a scrollable mobile sheet', async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  await page.getByRole('checkbox', { name: /Champagne/i }).check();
  const trigger = page.getByRole('button', { name: 'Open trip summary' });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: 'Trip summary' });
  await expect(sheet.getByText('Champagne, Coffee')).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Review trip' })).toBeEnabled();

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
  ).toBe(false);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('optional Extras remain usable while the connection is offline', async ({ page }) => {
  await page.goto(`${extrasFixture}?state=offline`);
  await expect(page.getByRole('status').filter({ hasText: 'You are offline' })).toBeVisible();
  const option = page.getByRole('checkbox', { name: /Fixture extra A/i });
  await option.check();
  await expect(option).toBeChecked();
  await option.uncheck();
  await expect(option).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();
});

test('an invalid selected Extra remains visible and can be deselected to recover', async ({
  page,
}) => {
  await page.goto(`${extrasFixture}?state=extras-invalid`);
  const invalid = page.getByRole('checkbox', { name: /Fixture extra A/i });
  await expect(invalid).toBeChecked();
  await expect(invalid).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Review trip' })).toBeDisabled();
  await expect(page.getByText('Remove an unavailable Extra before continuing.')).toBeVisible();
  await expect(
    page.getByRole('alert').filter({ hasText: 'selected extras option is no longer available' }),
  ).toBeVisible();
  await invalid.uncheck();
  await expect(invalid).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();
  await expect(page.getByRole('checkbox', { name: /Fixture extra B/i })).toBeEnabled();
});
