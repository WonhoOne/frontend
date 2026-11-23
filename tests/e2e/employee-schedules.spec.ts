import { expect, test } from '@playwright/test';

import {
  routeEmployeeInventory,
  routeEmployeeLogin,
  routeEmployeeSchedules,
  signInAsEmployee,
} from './support/employee-api';

/**
 * v0.3 demo scenario 3: 직원 여행 출발 → 물품 차감, 여행 완료.
 */
test.describe('Employee departures', () => {
  test.beforeEach(async ({ page }) => {
    await routeEmployeeLogin(page);
  });

  test('depart → souvenirs deducted → inventory shows the reduced stock → complete', async ({
    page,
  }) => {
    const inventory = await routeEmployeeInventory(page);
    inventory.items.find((item) => item.itemType === 'SCARF')!.quantity = 20;
    await routeEmployeeSchedules(page, inventory.items);
    await page.goto('/employee/login?returnTo=%2Femployee%2Fschedules');
    await signInAsEmployee(page);

    await expect(page.getByRole('heading', { level: 1, name: /출발 관리/ })).toBeVisible();
    const row = page.getByRole('row', { name: /E2E Synthetic Trekking/ });
    await expect(row).toContainText('출발 전');
    await expect(row.getByRole('button', { name: /완료 처리/ })).toBeDisabled();

    await row.getByRole('button', { name: /출발 처리/ }).click();
    const dialog = page.getByRole('dialog', { name: '출발 처리' });
    await expect(dialog).toContainText('아웃도어 기념품 스카프 3개');
    await dialog.getByRole('button', { name: '출발 처리', exact: true }).click();

    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole('status').filter({ hasText: '아웃도어 기념품 스카프 −3개, 남은 재고 17개' }),
    ).toBeVisible();
    await expect(row).toContainText('여행 중');

    await page
      .getByRole('navigation', { name: '직원 메뉴' })
      .getByRole('link', { name: '재고 관리' })
      .click();
    await expect(page.getByRole('row', { name: /아웃도어 기념품 스카프/ })).toContainText('17개');

    await page
      .getByRole('navigation', { name: '직원 메뉴' })
      .getByRole('link', { name: '출발 관리' })
      .click();
    await page
      .getByRole('row', { name: /E2E Synthetic Trekking/ })
      .getByRole('button', { name: /완료 처리/ })
      .click();
    const complete = page.getByRole('dialog', { name: '여행 완료 처리' });
    await complete.getByRole('button', { name: '완료 처리', exact: true }).click();
    await expect(page.getByRole('row', { name: /E2E Synthetic Trekking/ })).toContainText('완료');
  });

  test('insufficient stock names the short item and changes nothing', async ({ page }) => {
    const inventory = await routeEmployeeInventory(page);
    inventory.items.find((item) => item.itemType === 'SCARF')!.quantity = 2;
    await routeEmployeeSchedules(page, inventory.items);
    await page.goto('/employee/login?returnTo=%2Femployee%2Fschedules');
    await signInAsEmployee(page);

    await page
      .getByRole('row', { name: /E2E Synthetic Trekking/ })
      .getByRole('button', { name: /출발 처리/ })
      .click();
    const dialog = page.getByRole('dialog', { name: '출발 처리' });
    await dialog.getByRole('button', { name: '출발 처리', exact: true }).click();

    await expect(dialog.getByRole('alert')).toContainText('SCARF stock 2 is below the required 3.');
    expect(inventory.items.find((item) => item.itemType === 'SCARF')!.quantity).toBe(2);
  });
});
