import { expect, test } from '@playwright/test';

const draft = {
  schemaVersion: 1,
  tourProductId: 'tour-42',
  tourScheduleId: 'fixture:schedule:a',
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

async function seedDraft(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate((value) => sessionStorage.setItem('mister-world:reservation-draft:v1', JSON.stringify(value)), draft);
}

test('J02 Review creates once, clears Draft, survives Success refresh, and opens Detail', async ({ page }) => {
  await seedDraft(page);
  await page.goto('/reservation/review');
  const submit = page.getByRole('button', { name: 'Apply for reservation' });
  await expect(submit).toBeEnabled();
  await submit.dblclick();
  await expect(page).toHaveURL(/\/reservation\/801\/success$/);
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('mister-world:reservation-draft:v1'))).toBeNull();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  await page.getByRole('link', { name: 'View reservation details' }).click();
  await expect(page).toHaveURL(/\/reservations\/801$/);
  await expect(page.getByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
});

test('J10 Review stays inside a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await seedDraft(page);
  await page.goto('/reservation/review');
  await expect(page.getByRole('heading', { name: 'Review your trip' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.getByRole('button', { name: 'Apply for reservation' })).toBeVisible();
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

test('Success and Detail remain readable with reduced motion requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/reservation/801/success');
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  await page.goto('/reservations/801');
  await expect(page.getByRole('heading', { name: 'Mock 제주 허니문' })).toBeVisible();
});
