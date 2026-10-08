import { execFileSync } from 'node:child_process';
import process from 'node:process';

import { expect, test } from '@playwright/test';

const account = {
  loginId: 'f2-real-customer-101',
  password: 'f2-test-only-customer-password',
  name: 'Synthetic Customer',
  address: 'Synthetic integration address',
  contact: '01000000001',
};

test('real MySQL authenticated customer journey', async ({ page, request }) => {
  const backend = 'http://127.0.0.1:8080/api/v1';

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

  const catalog = (await (await request.get(`${backend}/tours`)).json()) as Array<{
    id: number;
    name: string;
  }>;
  expect(catalog).toHaveLength(1);
  expect(catalog[0]!.name).toBe('F2 Synthetic Golf');
  const scheduleResponse = await request.get(`${backend}/tour-schedules?tourId=${catalog[0]!.id}`);
  expect(scheduleResponse.status()).toBe(200);
  const schedules = (await scheduleResponse.json()) as Array<{
    id: number;
    reservable: boolean;
  }>;
  expect(schedules).toHaveLength(1);
  expect(schedules[0]!.reservable).toBe(true);

  await page.goto('/signup');
  await page.getByRole('textbox', { name: '로그인 ID' }).fill(account.loginId);
  await page.getByLabel('비밀번호').fill(account.password);
  await page.getByRole('textbox', { name: '성명' }).fill(account.name);
  await page.getByRole('textbox', { name: '주소' }).fill(account.address);
  await page.getByRole('textbox', { name: '연락처' }).fill(account.contact);
  await page.getByRole('button', { name: '회원가입' }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: 'Login', level: 1 })).toBeVisible();

  const login = async () => {
    await page.getByRole('textbox', { name: '로그인 ID' }).fill(account.loginId);
    await page.getByLabel('비밀번호').fill(account.password);
    await page.getByRole('button', { name: '로그인' }).click();
  };

  // Signup must not have silently created a session. Log in through the UI.
  await login();
  await expect(page).toHaveURL('/');
  const bearerResponse = await request.post(`${backend}/auth/login`, {
    data: { loginId: account.loginId, password: account.password },
  });
  expect(bearerResponse.status()).toBe(200);
  const session = (await bearerResponse.json()) as {
    accessToken: string;
    user: { role: string };
  };
  expect(session.user.role).toBe('CUSTOMER');
  const authorization = { Authorization: `Bearer ${session.accessToken}` };

  const emptyHistory = await request.get(`${backend}/customers/me/travel-history`, {
    headers: authorization,
  });
  expect(emptyHistory.status()).toBe(200);
  expect(await emptyHistory.json()).toEqual([]);
  const unauthenticatedHistory = await request.get(`${backend}/customers/me/travel-history`);
  expect(unauthenticatedHistory.status()).toBe(401);

  const creation = await request.post(`${backend}/reservations`, {
    headers: authorization,
    data: {
      scheduleId: schedules[0]!.id,
      participantCount: 2,
      configuration: {
        style: 'GRAND',
        hotelOption: 'HOTEL_4_STAR',
        transportOption: 'PRIVATE_LUXURY_CAR_2',
        mealOption: 'LOCAL_RESTAURANT',
        extraOptions: [],
      },
    },
  });
  expect(creation.status()).toBe(201);
  const created = (await creation.json()) as {
    id: number;
    tourProduct: { name: string };
  };
  expect(created.id).toBeGreaterThan(0);
  expect(created.tourProduct.name).toBe('F2 Synthetic Golf');

  const detail = await request.get(`${backend}/reservations/${created.id}`, {
    headers: authorization,
  });
  expect(detail.status()).toBe(200);
  expect(await detail.json()).toEqual(created);

  // Full document reload intentionally loses the in-memory bearer token.
  await page.goto(`/reservations/${created.id}`);
  await expect(
    page.getByRole('heading', { name: 'Sign in to view this reservation' }),
  ).toBeVisible();
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
  }, created.id);
  await page
    .getByRole('link', { name: /sign in|log in|login/i })
    .first()
    .click();
  await login();
  await expect(page.getByRole('heading', { name: 'F2 Synthetic Golf', level: 1 })).toBeVisible();
  await expect(page.getByText(`Reservation #${created.id}`, { exact: true })).toBeVisible();

  // End-to-end Browser Review: authenticated API setup is not a substitute
  // for the actual Review → Login → manual POST → Success navigation.
  await page.goto('/');
  await page.evaluate(
    ({ productId, scheduleId }) => {
      sessionStorage.setItem(
        'mister-world:reservation-draft:v1',
        JSON.stringify({
          schemaVersion: 1,
          tourProductId: productId,
          tourScheduleId: scheduleId,
          tourStyle: 'GRAND',
          participantCount: 2,
          configuration: {
            hotelSelectionKey: 'HOTEL_4_STAR',
            transportSelectionKey: 'PRIVATE_LUXURY_CAR_2',
            mealSelectionKey: 'LOCAL_RESTAURANT',
            extraSelectionKeys: [],
          },
          updatedAt: Date.now(),
        }),
      );
    },
    { productId: String(catalog[0]!.id), scheduleId: String(schedules[0]!.id) },
  );
  await page.goto('/reservation/review');
  await expect(page.getByRole('heading', { name: 'Review your trip' })).toBeVisible();

  let browserReservationPosts = 0;
  page.on('request', (requested) => {
    if (
      requested.method() === 'POST' &&
      new URL(requested.url()).pathname === '/api/v1/reservations'
    ) {
      browserReservationPosts += 1;
    }
  });
  await page.getByRole('button', { name: 'Apply for reservation' }).click();
  await expect(page).toHaveURL('/login');
  expect(browserReservationPosts).toBe(0);
  await login();
  await expect(page).toHaveURL('/reservation/review');
  await expect(page.getByRole('button', { name: 'Apply for reservation' })).toBeEnabled();
  expect(browserReservationPosts).toBe(0);

  await page.getByRole('button', { name: 'Apply for reservation' }).click();
  await expect(page).toHaveURL(/\/reservation\/\d+\/success$/);
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  expect(browserReservationPosts).toBe(1);
  await page.getByRole('link', { name: 'View reservation details' }).click();
  await expect(page).toHaveURL(/\/reservations\/\d+$/);
  await expect(page.getByRole('heading', { name: 'F2 Synthetic Golf' })).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem('mister-world:reservation-draft:v1')),
  ).toBeNull();

  // History eligibility is Backend-owned: a future trip must still be excluded.
  const stillEmpty = await request.get(`${backend}/customers/me/travel-history`, {
    headers: authorization,
  });
  expect(await stillEmpty.json()).toEqual([]);

  // Seed a completed snapshot in this disposable CI database only.
  // Public reservation creation rightly refuses dates in the past.
  const mysqlPassword = process.env.DB_PASSWORD;
  if (process.env.CI !== 'true' || !mysqlPassword) {
    throw new Error('Completed-history fixture requires isolated CI MySQL.');
  }
  const containers = execFileSync('docker', ['ps', '--quiet', '--filter', 'ancestor=mysql:8.4'], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);
  if (containers.length !== 1 || !/^[a-f0-9]{12,64}$/.test(containers[0] ?? '')) {
    throw new Error('Expected exactly one disposable MySQL service container.');
  }
  const mysqlContainer = containers[0]!;
  if (!Number.isSafeInteger(created.id) || created.id <= 0) {
    throw new Error('Invalid test reservation identity.');
  }

  const fixtureSql =
    [
      `UPDATE tour_schedule SET confirmed = TRUE WHERE id = ${schedules[0]!.id}`,
      `UPDATE tour_reservation SET schedule_start_date_snapshot = DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), schedule_end_date_snapshot = DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY) WHERE id = ${created.id}`,
    ].join('; ') + ';';
  execFileSync(
    'docker',
    [
      'exec',
      '-e',
      `MYSQL_PWD=${mysqlPassword}`,
      mysqlContainer,
      'mysql',
      '-u',
      'misterworld',
      'misterworld',
      '-e',
      fixtureSql,
    ],
    { stdio: 'pipe' },
  );

  const completedResponse = await request.get(`${backend}/customers/me/travel-history`, {
    headers: authorization,
  });
  expect(completedResponse.status()).toBe(200);
  const completed = (await completedResponse.json()) as Array<{
    reservationId: number;
    tourProduct: { name: string };
    price: { amount: number; currency: string };
  }>;
  expect(completed).toHaveLength(1);
  expect(completed[0]?.reservationId).toBe(created.id);
  expect(completed[0]?.tourProduct.name).toBe('F2 Synthetic Golf');
  expect(completed[0]?.price.currency).toBe('KRW');

  // New document + real login opens Previous Trips using the actual Backend.
  await page.goto('/login');
  await login();
  await expect(page).toHaveURL('/');
  const previousTrips = page.getByRole('dialog', { name: 'Your previous trips' });
  await expect(previousTrips).toBeVisible();
  await expect(previousTrips.getByRole('heading', { name: 'F2 Synthetic Golf' })).toBeVisible();
  await previousTrips.getByRole('button', { name: '전체 여행 보기' }).click();
  await expect(page).toHaveURL('/my-trips');
  await expect(page.getByRole('heading', { name: 'My Trips', level: 1 })).toBeVisible();
  await expect(
    page.locator('section[aria-labelledby="trip-history-heading"]').getByRole('heading', {
      name: 'F2 Synthetic Golf',
      level: 3,
    }),
  ).toBeVisible();
});
