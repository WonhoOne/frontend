import { expect, test } from '@playwright/test';

import { employeeName, routeEmployeeLogin, signInAsEmployee } from './support/employee-api';

/**
 * Employee access journeys (CP10 EJ01, EJ06, EJ07).
 */
test.describe('Employee access', () => {
  test.beforeEach(async ({ page }) => {
    await routeEmployeeLogin(page);
  });

  test('EJ01 anonymous /employee → Employee login → product list in the Employee shell', async ({
    page,
  }) => {
    await page.goto('/employee');

    await expect(page).toHaveURL(/\/employee\/login\?returnTo=%2Femployee%2Ftours$/);
    await signInAsEmployee(page);

    await expect(page).toHaveURL(/\/employee\/tours$/);
    await expect(page.getByRole('heading', { level: 1, name: '여행상품' })).toBeVisible();

    const nav = page.getByRole('navigation', { name: '직원 메뉴' });
    await expect(nav.getByRole('link', { name: '여행상품' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByText(employeeName)).toBeVisible();

    // Customer chrome must never appear in the Employee area.
    await expect(page.getByRole('link', { name: 'Login / Account' })).toHaveCount(0);

    // Login used replace navigation: Back does not reopen the filled login form.
    await page.goBack();
    await expect(page).not.toHaveURL(/\/employee\/login/);
  });

  test('EJ06 CUSTOMER credentials are refused on the Employee login and keep no session', async ({
    page,
  }) => {
    await page.goto('/employee/login');
    await signInAsEmployee(page, 'e2e-customer');

    await expect(page.getByRole('alert')).toHaveText(
      '직원 계정이 아닙니다. 직원 계정으로 로그인해 주세요.',
    );
    await expect(page.getByRole('navigation', { name: '직원 메뉴' })).toHaveCount(0);

    await page.goto('/employee/tours');
    await expect(page).toHaveURL(/\/employee\/login\?returnTo=/);
  });

  test('EJ07 reload on inventory → login → back on inventory', async ({ page }) => {
    await page.goto('/employee/login');
    await signInAsEmployee(page);
    await page
      .getByRole('navigation', { name: '직원 메뉴' })
      .getByRole('link', { name: '재고 관리' })
      .click();
    await expect(page.getByRole('heading', { level: 1, name: '재고 관리' })).toBeVisible();

    // The session is memory-only by design, so a reload signs the employee out.
    await page.reload();
    await expect(page).toHaveURL(/\/employee\/login\?returnTo=%2Femployee%2Finventory$/);

    await signInAsEmployee(page);
    await expect(page).toHaveURL(/\/employee\/inventory$/);
    await expect(page.getByRole('heading', { level: 1, name: '재고 관리' })).toBeVisible();
  });

  test('wrong credentials show one generic message', async ({ page }) => {
    await page.goto('/employee/login');
    await signInAsEmployee(page, 'unknown-id');

    await expect(page.getByRole('alert')).toHaveText('아이디 또는 비밀번호가 올바르지 않습니다.');
    await expect(page.getByLabel(/비밀번호/)).toHaveValue('');
  });

  test('sign-out returns to the Employee login with a notice', async ({ page }) => {
    await page.goto('/employee/login');
    await signInAsEmployee(page);
    await expect(page.getByRole('heading', { level: 1, name: '여행상품' })).toBeVisible();

    await page.getByRole('button', { name: '로그아웃' }).click();
    await expect(page).toHaveURL(/\/employee\/login$/);
    await expect(page.getByText('로그아웃했습니다.')).toBeVisible();
  });
});
