import { expect, test, type Page } from '@playwright/test';

const storageKey = 'mister-world:reservation-draft:v1';
const canonicalWidths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1728];

const draft = {
  schemaVersion: 1,
  tourProductId: '103',
  tourScheduleId: '1301',
  tourStyle: 'GRAND',
  participantCount: 2,
  configuration: {
    hotelSelectionKey: 'fixture:hotel:a',
    transportSelectionKey: 'fixture:transport:b',
    mealSelectionKey: 'fixture:meal:a',
    extraSelectionKeys: [],
  },
  updatedAt: 1,
};

async function seedDraft(page: Page) {
  await page.goto('/');
  await page.evaluate(({ key, value }) => sessionStorage.setItem(key, JSON.stringify(value)), {
    key: storageKey,
    value: draft,
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    ),
  ).toBe(false);
}

test('J02 Review creates once, clears Draft, survives Success refresh, and opens Detail', async ({
  page,
}) => {
  await seedDraft(page);
  await page.goto('/reservation/review');
  const submit = page.getByRole('button', { name: 'Apply for reservation' });
  await expect(submit).toBeEnabled();
  await submit.dblclick();
  await expect(page).toHaveURL(/\/reservation\/801\/success$/);
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key), storageKey))
    .toBeNull();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  await page.getByRole('link', { name: 'View reservation details' }).click();
  await expect(page).toHaveURL(/\/reservations\/801$/);
  await expect(page.getByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
});

for (const width of canonicalWidths) {
  test(`Reservation Review, Success, and Detail fit the ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await seedDraft(page);
    await page.goto('/reservation/review');
    await expect(page.getByRole('heading', { name: 'Review your trip' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/reservation/801/success');
    await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/reservations/801');
    await expect(page.getByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test('Reservation journey remains task-complete at a 200%-zoom equivalent width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await seedDraft(page);
  await page.goto('/reservation/review');
  await expect(page.getByRole('button', { name: 'Apply for reservation' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('J09 Review primary action is keyboard reachable', async ({ page }) => {
  await seedDraft(page);
  await page.goto('/reservation/review');
  const submit = page.getByRole('button', { name: 'Apply for reservation' });
  for (let index = 0; index < 20; index += 1) {
    if (await submit.evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(submit).toBeFocused();
});

test('Reservation read views remain readable with reduced motion requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/reservation/801/success');
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  await page.goto('/reservations/801');
  await expect(page.getByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
});
