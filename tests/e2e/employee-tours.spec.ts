import { expect, test } from '@playwright/test';

import { routeEmployeeLogin, routeEmployeeTours, signInAsEmployee } from './support/employee-api';

/**
 * Employee product list and create journeys (CP10 EJ02, EJ08).
 */
test.describe('Employee products', () => {
  test.beforeEach(async ({ page }) => {
    await routeEmployeeLogin(page);
  });

  test('EJ02 create a Golf product with three prices → highlighted in the list', async ({
    page,
  }) => {
    const api = await routeEmployeeTours(page);
    await page.goto('/employee/login');
    await signInAsEmployee(page);

    const table = page.getByRole('table', { name: '여행상품 목록' });
    await expect(table.getByRole('link', { name: 'E2E Synthetic Golf' })).toBeVisible();
    await expect(table).toContainText('₩1,800,000');

    await page.getByRole('link', { name: '+ 새 여행상품' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '새 여행상품' })).toBeVisible();

    await page.getByLabel(/테마/).selectOption('GOLF_CHALLENGE');
    await page.getByLabel(/상품명/).fill('제주 골프 3일');
    await page.getByLabel(/설명/).fill('바다를 보며 치는 골프 여행');
    await page.getByLabel(/Classic 1인 가격/).fill('890,000');
    await page.getByLabel(/Grand 1인 가격/).fill('1200000');
    await page.getByLabel(/Premium 1인 가격/).fill('1800000');
    await page.getByRole('button', { name: '저장' }).click();

    await expect(page).toHaveURL(/\/employee\/tours$/);
    await expect(page.getByRole('status')).toContainText(
      '‘제주 골프 3일’ 여행상품을 만들었습니다.',
    );
    await expect(table.getByRole('link', { name: '제주 골프 3일' })).toBeVisible();

    expect(api.writes).toEqual([
      {
        theme: 'GOLF_CHALLENGE',
        name: '제주 골프 3일',
        description: '바다를 보며 치는 골프 여행',
        stylePrices: [
          { style: 'CLASSIC', amount: 890000, currency: 'KRW' },
          { style: 'GRAND', amount: 1200000, currency: 'KRW' },
          { style: 'PREMIUM', amount: 1800000, currency: 'KRW' },
        ],
      },
    ]);

    // Back from the list does not reopen the completed form (replace navigation).
    await page.goBack();
    await expect(page).not.toHaveURL(/\/employee\/tours\/new$/);
  });

  test('Honeymoon only offers Grand and Premium prices', async ({ page }) => {
    await routeEmployeeTours(page);
    await page.goto('/employee/login?returnTo=%2Femployee%2Ftours%2Fnew');
    await signInAsEmployee(page);

    await page.getByLabel(/테마/).selectOption('HONEYMOON_ROMANCE');
    await expect(page.getByLabel(/Classic 1인 가격/)).toHaveCount(0);
    await expect(page.getByLabel(/Grand 1인 가격/)).toBeVisible();
    await expect(page.getByLabel(/Premium 1인 가격/)).toBeVisible();
  });

  test('EJ08 leaving with unsaved input asks first; stay keeps the input', async ({ page }) => {
    await routeEmployeeTours(page);
    await page.goto('/employee/login?returnTo=%2Femployee%2Ftours%2Fnew');
    await signInAsEmployee(page);

    await page.getByLabel(/상품명/).fill('작성 중인 상품');
    await page
      .getByRole('navigation', { name: '직원 메뉴' })
      .getByRole('link', { name: '재고 관리' })
      .click();

    const dialog = page.getByRole('dialog', { name: '저장하지 않은 변경 사항이 있습니다' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: '계속 편집' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByLabel(/상품명/)).toHaveValue('작성 중인 상품');

    await page.getByRole('button', { name: '취소' }).click();
    await page.getByRole('dialog').getByRole('button', { name: '나가기' }).click();
    await expect(page).toHaveURL(/\/employee\/tours$/);
  });
});
