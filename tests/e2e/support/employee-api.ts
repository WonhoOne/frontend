import { expect, type Page } from '@playwright/test';

/**
 * Employee browser fixture.
 *
 * The shipped Employee login UI and the real BackendAuthDataSource run unchanged;
 * only HTTP response bodies are controlled here. Synthetic identities only:
 * `e2e-employee` → EMPLOYEE, `e2e-customer` → CUSTOMER, anything else → 401.
 */
export const employeeName = 'E2E Synthetic Employee';
const employeeToken = 'e2e-employee-memory-only-token';

export async function routeEmployeeLogin(page: Page) {
  await page.route('**/api/v1/auth/login', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBeUndefined();

    const body = route.request().postDataJSON() as { loginId?: string };

    if (body.loginId === 'e2e-employee' || body.loginId === 'e2e-customer') {
      const employee = body.loginId === 'e2e-employee';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: employee ? employeeToken : 'e2e-customer-memory-only-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: employee
            ? { id: 9001, role: 'EMPLOYEE', name: employeeName }
            : { id: 9002, role: 'CUSTOMER', name: 'E2E Synthetic Customer' },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'LOGIN_FAILED', message: 'Synthetic', fieldErrors: [] }),
    });
  });
}

export async function signInAsEmployee(page: Page, loginId = 'e2e-employee') {
  await expect(page.getByRole('heading', { level: 1, name: '직원 로그인' })).toBeVisible();
  await page.getByLabel(/아이디/).fill(loginId);
  await page.getByLabel(/비밀번호/).fill('e2e-input-only');
  await page.getByRole('button', { name: '로그인' }).click();
}
