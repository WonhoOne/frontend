import { expect, test } from '@playwright/test';

import {
  routeEmployeeInventory,
  routeEmployeeLogin,
  signInAsEmployee,
} from './support/employee-api';

/**
 * Employee inventory journeys (CP10 EJ05, EJ09).
 */
test.describe('Employee inventory', () => {
  test.beforeEach(async ({ page }) => {
    await routeEmployeeLogin(page);
  });

  test('EJ05 add 5 to 골프공 → the row shows the server total', async ({ page }) => {
    const api = await routeEmployeeInventory(page);
    await page.goto('/employee/login?returnTo=%2Femployee%2Finventory');
    await signInAsEmployee(page);

    const table = page.getByRole('table', { name: '물품별 현재 재고' });
    await expect(table.getByRole('row', { name: /건강 인삼 기념품/ })).toContainText('0개');
    await expect(table.getByRole('textbox')).toHaveCount(0);

    await page.getByRole('button', { name: '골프공 재고 추가' }).click();
    const dialog = page.getByRole('dialog', { name: '골프공 재고 추가' });
    await expect(dialog).toContainText('현재 재고35개');
    await dialog.getByLabel(/추가할 수량/).fill('5');
    await expect(dialog).toContainText('추가 후 재고40개');
    await dialog.getByRole('button', { name: '추가', exact: true }).click();

    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole('status').filter({ hasText: '골프공 재고를 5개 추가했습니다. 현재 40개' }),
    ).toBeVisible();
    await expect(table.getByRole('row', { name: /골프공/ })).toContainText('40개');
    await expect(page.getByRole('button', { name: '골프공 재고 추가' })).toBeFocused();
    expect(api.adds).toEqual([{ itemType: 'GOLF_BALL', quantity: 5 }]);
  });

  test('EJ09 lost response → re-read → explicit confirmation before adding again', async ({
    page,
  }) => {
    const api = await routeEmployeeInventory(page);
    await page.goto('/employee/login?returnTo=%2Femployee%2Finventory');
    await signInAsEmployee(page);

    api.control.loseNextAddResponse = true;
    await page.getByRole('button', { name: '골프공 재고 추가' }).click();
    const dialog = page.getByRole('dialog', { name: '골프공 재고 추가' });
    await dialog.getByLabel(/추가할 수량/).fill('5');
    await dialog.getByRole('button', { name: '추가', exact: true }).click();

    const alert = dialog.getByRole('alert');
    await expect(alert).toContainText('추가가 반영되었는지 확인할 수 없습니다.');
    await expect(dialog.getByRole('button', { name: '다시 추가' })).toBeDisabled();

    await dialog.getByRole('button', { name: '현재 재고 다시 보기' }).click();
    await expect(alert).toContainText('지금 재고 40개');
    await expect(alert).toContainText('반영된 것으로 보입니다');

    // Nothing was resent automatically.
    expect(api.adds).toHaveLength(1);

    await dialog.getByRole('button', { name: '다시 추가' }).click();
    await expect(dialog).toContainText('한 번 더 더해질 수 있습니다');
    await dialog.getByRole('button', { name: '취소' }).click();
    await dialog.getByRole('button', { name: '닫기' }).click();

    await expect(
      page.getByRole('status').filter({ hasText: '재고 추가 결과를 확인하지 못했습니다' }),
    ).toBeVisible();
    expect(api.adds).toHaveLength(1);
  });

  test('a quantity of zero is refused before sending', async ({ page }) => {
    const api = await routeEmployeeInventory(page);
    await page.goto('/employee/login?returnTo=%2Femployee%2Finventory');
    await signInAsEmployee(page);

    await page.getByRole('button', { name: '스카프 재고 추가' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/추가할 수량/).fill('0');
    await dialog.getByRole('button', { name: '추가', exact: true }).click();

    await expect(dialog).toContainText('1개 이상 입력해 주세요.');
    expect(api.adds).toHaveLength(0);
  });
});
