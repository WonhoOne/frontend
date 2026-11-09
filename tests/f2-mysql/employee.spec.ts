import process from 'node:process';

import { expect, test } from '@playwright/test';

/**
 * Real Backend + MySQL Employee journeys (CP10 EJ01, EJ02, EJ03, EJ04, EJ06).
 *
 * ORDER: this spec writes TourProducts, so it runs after the customer and Voice specs
 * that expect the seeded one-product catalog (see `playwright.f2-mysql.config.ts`).
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

test('real Backend Employee sign-in, product create/edit, Theme lock and CUSTOMER refusal', async ({
  page,
  request,
}) => {
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
  await expect(page.getByRole('link', { name: 'F2 Synthetic Golf' })).toBeVisible();

  // EJ02 — create a product through the UI and confirm it is persisted (NFR-02).
  const productName = 'F2 Employee Trekking';
  await page.getByRole('link', { name: '+ 새 여행상품' }).click();
  await page.getByLabel(/테마/).selectOption('OUTDOOR_TREKKING');
  await page.getByLabel(/상품명/).fill(productName);
  await page.getByLabel(/설명/).fill('Disposable integration-only Employee product.');
  await page.getByLabel(/Classic 1인 가격/).fill('300000');
  await page.getByLabel(/Grand 1인 가격/).fill('450000');
  await page.getByLabel(/Premium 1인 가격/).fill('700000');
  await page.getByRole('button', { name: '저장' }).click();

  await expect(page).toHaveURL(/\/employee\/tours$/);
  await expect(
    page.getByRole('status').filter({ hasText: `‘${productName}’ 여행상품을 만들었습니다.` }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: productName })).toBeVisible();

  const token = ((await apiLogin.json()) as { accessToken: string }).accessToken;
  const persisted = (await (
    await request.get(`${backend}/employee/tours`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()) as Array<{ name: string; theme: string; stylePrices: Array<{ amount: number }> }>;
  const created = persisted.find((product) => product.name === productName);
  expect(created?.theme).toBe('OUTDOOR_TREKKING');
  expect(created?.stylePrices.map(({ amount }) => amount)).toEqual([300000, 450000, 700000]);

  // EJ03 — edit a price on the product just created; the editor shows the server value.
  await page.getByRole('link', { name: productName }).click();
  await page.getByLabel(/Grand 1인 가격/).fill('480000');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: '변경 사항을 저장했습니다.' }),
  ).toBeVisible();
  await expect(page.getByLabel(/Grand 1인 가격/)).toHaveValue('480000');

  // EJ04 — the seeded product has a schedule: a different Theme is refused with a real 409,
  // other edits survive, and a same-Theme save succeeds after reverting the Theme.
  await page
    .getByRole('navigation', { name: '직원 메뉴' })
    .getByRole('link', { name: '여행상품' })
    .click();
  await page.getByRole('link', { name: 'F2 Synthetic Golf' }).click();
  await page.getByLabel(/설명/).fill('Edited by the real Employee journey.');
  await page.getByLabel(/테마/).selectOption('OUTDOOR_TREKKING');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByRole('alert')).toContainText('테마를 바꿀 수 없습니다');
  await expect(page.getByLabel(/설명/)).toHaveValue('Edited by the real Employee journey.');
  await page.getByRole('button', { name: '테마 되돌리기' }).click();
  await page.getByRole('button', { name: '저장' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: '변경 사항을 저장했습니다.' }),
  ).toBeVisible();

  const afterEdits = (await (
    await request.get(`${backend}/employee/tours`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()) as Array<{
    name: string;
    theme: string;
    description: string;
    stylePrices: Array<{ amount: number }>;
  }>;
  expect(afterEdits.find((product) => product.name === productName)?.stylePrices[1]?.amount).toBe(
    480000,
  );
  const seeded = afterEdits.find((product) => product.name === 'F2 Synthetic Golf');
  expect(seeded?.theme).toBe('GOLF_CHALLENGE');
  expect(seeded?.description).toBe('Edited by the real Employee journey.');

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
