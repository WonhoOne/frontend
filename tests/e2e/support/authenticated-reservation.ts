import { expect, type Page } from '@playwright/test';

/**
 * Authenticate through the shipped Login UI and the actual BackendAuthDataSource.
 * Only HTTP response bodies are controlled by this browser-level fixture.
 * The access token stays in the application's document-memory session store.
 */
const reservationDto = {
  id: 801,
  participantCount: 2,
  tourProduct: {
    id: 201,
    theme: 'HONEYMOON_ROMANCE',
    name: 'Synthetic Honeymoon',
  },
  schedule: {
    id: 501,
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    recruitment: {
      unit: 'COUPLE_TEAM',
      currentCount: 1,
      requiredCount: 2,
      confirmed: false,
    },
  },
  configuration: {
    style: 'GRAND',
    hotelOption: 'HOTEL_4_STAR',
    transportOption: 'PRIVATE_LUXURY_CAR_2',
    mealOption: 'LOCAL_RESTAURANT',
    extraOptions: ['CHAMPAGNE'],
  },
  price: {
    unitPrice: 1800000,
    subtotal: 3600000,
    discount: {
      type: 'LOYALTY',
      ratePercent: 5,
      amount: 180000,
    },
    total: 3420000,
    currency: 'KRW',
  },
};

const accessToken = 'e2e-synthetic-memory-only-token';
const returnContextKey = 'mister-world:return-context:v1';

export async function openAuthenticatedReservation(
  page: Page,
  returnTo: '/reservation/801/success' | '/reservations/801',
) {
  let reservationReads = 0;

  await page.route('**/api/v1/auth/login', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().authorization).toBeUndefined();

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: { id: 101, role: 'CUSTOMER', name: 'Synthetic Customer' },
      }),
    });
  });

  await page.route('**/api/v1/reservations/801', async (route) => {
    expect(route.request().method()).toBe('GET');
    expect(route.request().headers().authorization).toBe(`Bearer ${accessToken}`);
    reservationReads += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(reservationDto),
    });
  });

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Login', level: 1 })).toBeVisible();

  // Production ReturnContext persists only validated navigation metadata, never credentials.
  await page.evaluate(
    ({ key, target }) => {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          schemaVersion: 1,
          returnTo: target,
          intent: 'continue-navigation',
          draftSchemaVersion: 1,
          createdAt: Date.now(),
        }),
      );
    },
    { key: returnContextKey, target: returnTo },
  );

  await page.getByRole('textbox', { name: '로그인 ID' }).fill('synthetic-customer');
  await page.getByLabel('비밀번호').fill('synthetic-password');
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page).toHaveURL(returnTo);
  await expect.poll(() => reservationReads).toBeGreaterThan(0);
  return { getReservationReads: () => reservationReads };
}
