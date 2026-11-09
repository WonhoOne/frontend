import { expect, test, type Page } from '@playwright/test';

import {
  routeEmployeeInventory,
  routeEmployeeLogin,
  routeEmployeeTours,
} from './support/employee-api';

/**
 * CP10 EJ10 — keyboard-only Employee journeys (EJ02 create + EJ05 stock add) and CP9
 * A12 reduced motion. The native <select> is reached by keyboard; its value is set with
 * selectOption because platform keyboard handling of closed selects differs by OS.
 */
async function tabUntilFocused(page: Page, isTarget: () => Promise<boolean>, max = 40) {
  for (let step = 0; step < max; step += 1) {
    if (await isTarget()) {
      return;
    }

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard focus never reached the expected element.');
}

async function signInWithKeyboard(page: Page) {
  await page.getByLabel(/아이디/).focus();
  await page.keyboard.type('e2e-employee');
  await page.keyboard.press('Tab');
  await page.keyboard.type('e2e-input-only');
  await page.keyboard.press('Enter');
}

test.describe('Employee keyboard and motion', () => {
  test.beforeEach(async ({ page }) => {
    await routeEmployeeLogin(page);
  });

  test('EJ10 keyboard-only: sign in, create a product, add stock', async ({ page }) => {
    await routeEmployeeTours(page);
    const inventory = await routeEmployeeInventory(page);
    await page.goto('/employee/login');
    await signInWithKeyboard(page);
    await expect(page.getByRole('heading', { level: 1, name: '여행상품' })).toBeVisible();

    const createLink = page.getByRole('link', { name: '+ 새 여행상품' });
    await tabUntilFocused(page, () =>
      createLink.evaluate((node) => node === document.activeElement),
    );
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: '새 여행상품' })).toBeVisible();

    const theme = page.getByLabel(/테마/);
    await tabUntilFocused(page, () => theme.evaluate((node) => node === document.activeElement));
    await theme.selectOption('OUTDOOR_TREKKING');
    await page.keyboard.press('Tab');
    await page.keyboard.type('키보드 트레킹');
    await page.keyboard.press('Tab');
    await page.keyboard.type('키보드만으로 만든 상품');
    await page.keyboard.press('Tab');
    await page.keyboard.type('300000');
    await page.keyboard.press('Tab');
    await page.keyboard.type('450000');
    await page.keyboard.press('Tab');
    await page.keyboard.type('700000');
    await page.keyboard.press('Enter');

    await expect(
      page.getByRole('status').filter({ hasText: '‘키보드 트레킹’ 여행상품을 만들었습니다.' }),
    ).toBeVisible();

    const inventoryLink = page
      .getByRole('navigation', { name: '직원 메뉴' })
      .getByRole('link', { name: '재고 관리' });
    await inventoryLink.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: '재고 관리' })).toBeVisible();

    const addGolf = page.getByRole('button', { name: '골프공 재고 추가' });
    await tabUntilFocused(page, () => addGolf.evaluate((node) => node === document.activeElement));
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: '골프공 재고 추가' });
    await expect(dialog.getByLabel(/추가할 수량/)).toBeFocused();
    await page.keyboard.type('5');
    await page.keyboard.press('Enter');

    await expect(dialog).toHaveCount(0);
    await expect(addGolf).toBeFocused();
    expect(inventory.adds).toEqual([{ itemType: 'GOLF_BALL', quantity: 5 }]);
  });

  test('skip link moves focus to the main landmark', async ({ page }) => {
    await routeEmployeeTours(page);
    await page.goto('/employee/login');
    await signInWithKeyboard(page);
    await expect(page.getByRole('heading', { level: 1, name: '여행상품' })).toBeVisible();

    const skip = page.getByRole('link', { name: '본문으로 건너뛰기' });
    await skip.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('reduced motion keeps the created-row highlight static', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await routeEmployeeTours(page);
    await page.goto('/employee/login?returnTo=%2Femployee%2Ftours%2Fnew');
    await signInWithKeyboard(page);

    await page.getByLabel(/테마/).selectOption('PARENTS_HEALING');
    await page.getByLabel(/상품명/).fill('Reduced Motion Product');
    await page.getByLabel(/설명/).fill('Synthetic');
    await page.getByLabel(/Grand 1인 가격/).fill('1000000');
    await page.getByLabel(/Premium 1인 가격/).fill('1500000');
    await page.getByRole('button', { name: '저장' }).click();

    const row = page.locator('tr', { hasText: 'Reduced Motion Product' });
    await expect(row).toBeVisible();
    const animation = await row
      .locator('td')
      .first()
      .evaluate((cell) => getComputedStyle(cell).animationName);
    expect(animation).toBe('none');
  });
});
