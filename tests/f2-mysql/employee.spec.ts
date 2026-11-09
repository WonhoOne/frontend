import process from 'node:process';

import { expect, test } from '@playwright/test';

/**
 * Real Backend + MySQL Employee access (CP10 EJ01, EJ06).
 *
 * The EMPLOYEE account is created by the Backend `EmployeeBootstrap` from the
 * disposable CI-only values in `.github/workflows/d11-verify.yml`. They are not real
 * credentials and are never used outside this disposable database.
 */
const backend = 'http://127.0.0.1:8080/api/v1';

function requiredEnv(name: string) {
  const value = process.env[name];

  if (value === undefined || value.length === 0) {
    throw new Error(`${name} must be set for the real Employee journey.`);
  }

  return value;
}

test('real Backend Employee sign-in and CUSTOMER refusal', async ({ page, request }) => {
  const employeeLoginId = requiredEnv('EMPLOYEE_LOGIN_ID');
  const employeePassword = requiredEnv('EMPLOYEE_PASSWORD');
  const employeeName = requiredEnv('EMPLOYEE_NAME');

  await expect
    .poll(
      async () => {
        try {
          return (await request.get(`${backend}/tours`)).status();
        } catch {
          return 0;
        }
      },
      { timeout: 90_000 },
    )
    .toBe(200);

  // Backend authority check first: the bootstrap account is a real EMPLOYEE.
  const apiLogin = await request.post(`${backend}/auth/login`, {
    data: { loginId: employeeLoginId, password: employeePassword },
  });
  expect(apiLogin.status()).toBe(200);
  expect(((await apiLogin.json()) as { user: { role: string } }).user.role).toBe('EMPLOYEE');

  // EJ01 — anonymous entry → Employee login → product list.
  await page.goto('/employee');
  await expect(page).toHaveURL(/\/employee\/login\?returnTo=%2Femployee%2Ftours$/);
  await page.getByLabel(/아이디/).fill(employeeLoginId);
  await page.getByLabel(/비밀번호/).fill(employeePassword);
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page).toHaveURL(/\/employee\/tours$/);
  await expect(page.getByRole('heading', { level: 1, name: '여행상품' })).toBeVisible();
  await expect(page.getByText(employeeName)).toBeVisible();

  await page.getByRole('button', { name: '로그아웃' }).click();
  await expect(page.getByText('로그아웃했습니다.')).toBeVisible();

  // EJ06 — a real CUSTOMER is refused by the Employee login and keeps no session.
  const customer = {
    loginId: 'f2-employee-spec-customer',
    password: 'f2-test-only-customer-password',
    name: 'Synthetic Customer',
    address: 'Synthetic integration address',
    contact: '01000000002',
  };
  const signup = await request.post(`${backend}/auth/signup`, { data: customer });
  expect([201, 409]).toContain(signup.status());

  await page.getByLabel(/아이디/).fill(customer.loginId);
  await page.getByLabel(/비밀번호/).fill(customer.password);
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    '직원 계정이 아닙니다. 직원 계정으로 로그인해 주세요.',
  );
  await page.goto('/employee/tours');
  await expect(page).toHaveURL(/\/employee\/login\?returnTo=/);
});
