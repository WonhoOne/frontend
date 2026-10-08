import { expect, test } from '@playwright/test';

const account = {
  loginId: 'f2-real-customer-101',
  password: 'f2-test-only-customer-password',
  name: 'Synthetic Customer',
  address: 'Synthetic integration address',
  contact: '01000000001',
};

test('real MySQL signup, login, reservation, cold detail, and empty history without HTTP fixtures', async ({
  page,
  request,
}) => {
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
  const schedules = (await scheduleResponse.json()) as Array<{ id: number; reservable: boolean }>;
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
  await page.getByRole('link', { name: /sign in|log in|login/i }).first().click();
  await login();
  await expect(page.getByRole('heading', { name: 'F2 Synthetic Golf', level: 1 })).toBeVisible();
  await expect(page.getByText(`Reservation #${created.id}`, { exact: true })).toBeVisible();

  // History eligibility is Backend-owned: a future trip must still be excluded.
  const stillEmpty = await request.get(`${backend}/customers/me/travel-history`, {
    headers: authorization,
  });
  expect(await stillEmpty.json()).toEqual([]);
});
