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

interface StubTourProduct {
  id: number;
  theme: string;
  name: string;
  description: string;
  availableStyles: string[];
  stylePrices: Array<{ style: string; amount: number; currency: 'KRW' }>;
}

export const stubGolfProduct: StubTourProduct = {
  id: 301,
  theme: 'GOLF_CHALLENGE',
  name: 'E2E Synthetic Golf',
  description: 'Synthetic Employee E2E product.',
  availableStyles: ['CLASSIC', 'GRAND', 'PREMIUM'],
  stylePrices: [
    { style: 'CLASSIC', amount: 1200000, currency: 'KRW' },
    { style: 'GRAND', amount: 1800000, currency: 'KRW' },
    { style: 'PREMIUM', amount: 2500000, currency: 'KRW' },
  ],
};

/**
 * Stateful Employee TourProduct API stub. Requires the Bearer token from the shipped
 * login flow, mirrors REST v0.2 response shapes and records write bodies.
 */
export async function routeEmployeeTours(
  page: Page,
  initial: StubTourProduct[] = [stubGolfProduct],
  /** Products that have a linked schedule: a different-Theme PUT returns 409 (BR-31). */
  scheduledIds: ReadonlySet<number> = new Set([stubGolfProduct.id]),
) {
  const products = [...initial];
  const writes: unknown[] = [];

  await page.route('**/api/v1/employee/tours**', async (route) => {
    const request = route.request();
    expect(request.headers().authorization).toBe(`Bearer ${employeeToken}`);

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(products),
      });
      return;
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON() as Omit<StubTourProduct, 'id' | 'availableStyles'>;
      writes.push(body);
      const created: StubTourProduct = {
        id: Math.max(300, ...products.map((product) => product.id)) + 1,
        ...body,
        availableStyles: body.stylePrices.map(({ style }) => style),
      };
      products.push(created);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
      return;
    }

    if (request.method() === 'PUT') {
      const id = Number(new URL(request.url()).pathname.split('/').at(-1));
      const index = products.findIndex((product) => product.id === id);
      const body = request.postDataJSON() as Omit<StubTourProduct, 'id' | 'availableStyles'>;
      writes.push(body);
      const current = products[index];

      if (current === undefined) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'TOUR_PRODUCT_NOT_FOUND',
            message: 'Synthetic',
            fieldErrors: [],
          }),
        });
        return;
      }

      if (scheduledIds.has(id) && current.theme !== body.theme) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'TOUR_PRODUCT_THEME_LOCKED',
            message: 'Synthetic',
            fieldErrors: [],
          }),
        });
        return;
      }

      const updated: StubTourProduct = {
        id,
        ...body,
        availableStyles: body.stylePrices.map(({ style }) => style),
      };
      products[index] = updated;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updated),
      });
      return;
    }

    await route.fallback();
  });

  return { products, writes };
}

/**
 * Stateful Employee Inventory API stub (additive POST only). `loseNextAddResponse`
 * applies the next add on the "server" but aborts the HTTP response, to exercise the
 * unknown-outcome path without guessing.
 */
export async function routeEmployeeInventory(page: Page) {
  const items = [
    { id: 1, itemType: 'COUPLE_TSHIRT', quantity: 12 },
    { id: 2, itemType: 'GINSENG_GIFT', quantity: 0 },
    { id: 3, itemType: 'GOLF_BALL', quantity: 35 },
    { id: 4, itemType: 'SCARF', quantity: 8 },
  ];
  const adds: Array<{ itemType: string; quantity: number }> = [];
  const control = { loseNextAddResponse: false };

  await page.route('**/api/v1/employee/inventory', async (route) => {
    const request = route.request();
    expect(request.headers().authorization).toBe(`Bearer ${employeeToken}`);

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(items),
      });
      return;
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON() as { itemType: string; quantity: number };
      adds.push(body);
      const item = items.find((candidate) => candidate.itemType === body.itemType);

      if (item === undefined) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'MALFORMED_REQUEST',
            message: 'Synthetic',
            fieldErrors: [],
          }),
        });
        return;
      }

      item.quantity += body.quantity;

      if (control.loseNextAddResponse) {
        control.loseNextAddResponse = false;
        await route.abort('connectionreset');
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(item),
      });
      return;
    }

    await route.fallback();
  });

  return { items, adds, control };
}

interface StubSchedule {
  id: number;
  tourId: number;
  tourName: string;
  theme: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  confirmed: boolean;
  operationStatus: 'SCHEDULED' | 'DEPARTED' | 'COMPLETED';
}

const souvenirByTheme: Readonly<Record<string, string>> = {
  HONEYMOON_ROMANCE: 'COUPLE_TSHIRT',
  PARENTS_HEALING: 'GINSENG_GIFT',
  GOLF_CHALLENGE: 'GOLF_BALL',
  OUTDOOR_TREKKING: 'SCARF',
};

export const stubTrekkingSchedule: StubSchedule = {
  id: 5,
  tourId: 2,
  tourName: 'E2E Synthetic Trekking',
  theme: 'OUTDOOR_TREKKING',
  startDate: '2026-12-19',
  endDate: '2026-12-21',
  participantCount: 3,
  confirmed: true,
  operationStatus: 'SCHEDULED',
};

/**
 * Stateful v0.3 demo departure-operations stub. Deducts from the given inventory
 * items (pass the `items` of `routeEmployeeInventory`) so the inventory page reflects it.
 */
export async function routeEmployeeSchedules(
  page: Page,
  inventory: Array<{ itemType: string; quantity: number }>,
  initial: StubSchedule[] = [stubTrekkingSchedule],
) {
  const schedules = initial.map((schedule) => ({ ...schedule }));
  const conflict = (code: string, message = 'Synthetic') => ({
    status: 409,
    contentType: 'application/json',
    body: JSON.stringify({ code, message, fieldErrors: [] }),
  });

  await page.route('**/api/v1/employee/tour-schedules**', async (route) => {
    const request = route.request();
    expect(request.headers().authorization).toBe(`Bearer ${employeeToken}`);
    const segments = new URL(request.url()).pathname.split('/');
    const action = segments.at(-1);

    if (request.method() === 'GET' && action === 'tour-schedules') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(schedules),
      });
      return;
    }

    if (request.method() !== 'POST') {
      await route.fallback();
      return;
    }

    const schedule = schedules.find((candidate) => candidate.id === Number(segments.at(-2)));

    if (schedule === undefined) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'TOUR_SCHEDULE_NOT_FOUND',
          message: 'Synthetic',
          fieldErrors: [],
        }),
      });
      return;
    }

    if (action === 'departure') {
      if (schedule.operationStatus !== 'SCHEDULED') {
        await route.fulfill(conflict('SCHEDULE_ALREADY_DEPARTED'));
        return;
      }

      if (!schedule.confirmed) {
        await route.fulfill(conflict('SCHEDULE_NOT_CONFIRMED'));
        return;
      }

      const itemType = souvenirByTheme[schedule.theme] ?? 'SCARF';
      const quantity =
        schedule.theme === 'HONEYMOON_ROMANCE'
          ? Math.floor(schedule.participantCount / 2)
          : schedule.participantCount;
      const item = inventory.find((candidate) => candidate.itemType === itemType);

      if (item === undefined || item.quantity < quantity) {
        await route.fulfill(
          conflict(
            'INSUFFICIENT_INVENTORY',
            `${itemType} stock ${item?.quantity ?? 0} is below the required ${quantity}.`,
          ),
        );
        return;
      }

      item.quantity -= quantity;
      schedule.operationStatus = 'DEPARTED';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schedule,
          deductedItems:
            quantity === 0 ? [] : [{ itemType, quantity, remainingQuantity: item.quantity }],
        }),
      });
      return;
    }

    if (action === 'completion') {
      if (schedule.operationStatus !== 'DEPARTED') {
        await route.fulfill(conflict('SCHEDULE_NOT_DEPARTED'));
        return;
      }

      schedule.operationStatus = 'COMPLETED';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ schedule }),
      });
      return;
    }

    await route.fallback();
  });

  return { schedules };
}
