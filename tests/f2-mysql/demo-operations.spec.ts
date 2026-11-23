import process from 'node:process';

import { expect, test } from '@playwright/test';

/**
 * Real Backend + MySQL: final demo scenario operations against the actual API.
 *  - 2.2.1 customer modifies a reservation (Grand, coffee and champagne)
 *  - 3.1 employee departs the schedule → the Theme souvenir (golf balls) leaves stock
 *  - 3.2 employee completes the trip → it appears in the customer's travel history
 *
 * ORDER: this spec departs and completes the only seeded schedule, so it runs last
 * (see `playwright.f2-mysql.config.ts`). Disposable CI database only; SMS is disabled.
 */
const backend = 'http://127.0.0.1:8080/api/v1';
const customer = {
  loginId: 'f2-demo-ops-customer',
  password: 'f2-test-only-customer-password',
  name: 'Synthetic Ops Customer',
  address: 'Synthetic integration address',
  contact: '01000000002',
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} must be set for the real demo operations journey.`);
  }
  return value;
}

test('real Backend demo operations: modify, depart with stock deduction, complete', async ({
  page,
  request,
}) => {
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

  // Customer with a fresh 3-participant reservation on the seeded golf schedule.
  expect((await request.post(`${backend}/auth/signup`, { data: customer })).status()).toBe(201);
  const customerLogin = await request.post(`${backend}/auth/login`, {
    data: { loginId: customer.loginId, password: customer.password },
  });
  const customerToken = ((await customerLogin.json()) as { accessToken: string }).accessToken;
  const customerAuth = { Authorization: `Bearer ${customerToken}` };
  const catalog = (await (await request.get(`${backend}/tours`)).json()) as Array<{
    id: number;
    name: string;
  }>;
  const golf = catalog.find((product) => product.name === 'F2 Synthetic Golf')!;
  const schedule = (
    (await (await request.get(`${backend}/tour-schedules?tourId=${golf.id}`)).json()) as Array<{
      id: number;
    }>
  )[0]!;
  const created = await request.post(`${backend}/reservations`, {
    headers: customerAuth,
    data: {
      scheduleId: schedule.id,
      participantCount: 3,
      configuration: {
        style: 'CLASSIC',
        hotelOption: 'HOTEL_3_STAR',
        transportOption: 'PREMIUM_VAN_10',
        mealOption: 'LUNCH_BOX',
        extraOptions: [],
      },
    },
  });
  expect(created.status()).toBe(201);
  const reservation = (await created.json()) as { id: number };

  // 2.2.1 — the customer edits the trip in the real UI.
  await page.goto(`/reservations/${reservation.id}`);
  await page.evaluate((id) => {
    sessionStorage.setItem(
      'mister-world:return-context:v1',
      JSON.stringify({
        schemaVersion: 1,
        returnTo: `/reservations/${id}`,
        intent: 'continue-navigation',
        draftSchemaVersion: 1,
        createdAt: Date.now(),
      }),
    );
  }, reservation.id);
  await page
    .getByRole('link', { name: /sign in|log in|login/i })
    .first()
    .click();
  await page.getByRole('textbox', { name: '로그인 ID' }).fill(customer.loginId);
  await page.getByLabel('비밀번호').fill(customer.password);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page.getByText(`Reservation #${reservation.id}`, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Edit trip' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit trip' });
  await dialog.getByRole('radio', { name: 'Grand' }).check();
  await dialog.getByRole('checkbox', { name: 'Coffee' }).check();
  await dialog.getByRole('checkbox', { name: 'Champagne' }).check();
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Trip updated.' })).toContainText(
    '1,200,000',
  );

  const modified = (await (
    await request.get(`${backend}/reservations/${reservation.id}`, { headers: customerAuth })
  ).json()) as {
    participantCount: number;
    configuration: { style: string; extraOptions: string[] };
    price: { unitPrice: number; total: number };
  };
  expect(modified.participantCount).toBe(3);
  expect(modified.configuration.style).toBe('GRAND');
  expect(modified.configuration.extraOptions).toEqual(['CHAMPAGNE', 'COFFEE']);
  expect(modified.price.unitPrice).toBe(400000);

  // Employee stocks golf balls (scenario 1), then departs and completes in the real UI.
  const employeeLoginId = requiredEnv('EMPLOYEE_LOGIN_ID');
  const employeePassword = requiredEnv('EMPLOYEE_PASSWORD');
  const employeeLogin = await request.post(`${backend}/auth/login`, {
    data: { loginId: employeeLoginId, password: employeePassword },
  });
  const employeeAuth = {
    Authorization: `Bearer ${((await employeeLogin.json()) as { accessToken: string }).accessToken}`,
  };
  const stocked = await request.post(`${backend}/employee/inventory`, {
    headers: employeeAuth,
    data: { itemType: 'GOLF_BALL', quantity: 100 },
  });
  expect(stocked.status()).toBe(200);
  const before = ((await stocked.json()) as { quantity: number }).quantity;
  const operations = (await (
    await request.get(`${backend}/employee/tour-schedules`, { headers: employeeAuth })
  ).json()) as Array<{ id: number; participantCount: number; confirmed: boolean }>;
  const target = operations.find((row) => row.id === schedule.id)!;
  expect(target.confirmed).toBe(true);

  await page.goto('/employee/login?returnTo=%2Femployee%2Fschedules');
  await page.getByLabel(/아이디/).fill(employeeLoginId);
  await page.getByLabel(/비밀번호/).fill(employeePassword);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /출발 관리/ })).toBeVisible();

  const row = page.getByRole('row', { name: /F2 Synthetic Golf/ });
  await row.getByRole('button', { name: /출발 처리/ }).click();
  const depart = page.getByRole('dialog', { name: '출발 처리' });
  await depart.getByRole('button', { name: '출발 처리', exact: true }).click();
  await expect(depart).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: `남은 재고 ${before - target.participantCount}개` }),
  ).toBeVisible();
  await expect(row).toContainText('여행 중');

  const inventory = (await (
    await request.get(`${backend}/employee/inventory`, { headers: employeeAuth })
  ).json()) as Array<{ itemType: string; quantity: number }>;
  expect(inventory.find((item) => item.itemType === 'GOLF_BALL')!.quantity).toBe(
    before - target.participantCount,
  );
  expect(
    (
      (await (await request.get(`${backend}/tour-schedules/${schedule.id}`)).json()) as {
        reservable: boolean;
      }
    ).reservable,
  ).toBe(false);

  await row.getByRole('button', { name: /완료 처리/ }).click();
  const complete = page.getByRole('dialog', { name: '여행 완료 처리' });
  await complete.getByRole('button', { name: '완료 처리', exact: true }).click();
  await expect(row).toContainText('완료');

  const history = (await (
    await request.get(`${backend}/customers/me/travel-history`, { headers: customerAuth })
  ).json()) as Array<{ reservationId: number }>;
  expect(history.map((trip) => trip.reservationId)).toContain(reservation.id);
});
