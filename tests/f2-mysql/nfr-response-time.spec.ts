import process from 'node:process';

import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * NFR-05 evidence: "주요 Backend 요청 응답시간은 3초 이내이다."
 *
 * Measures the main requests the Frontend makes, against the real Backend + MySQL in CI,
 * after the Customer, Voice and Employee journeys have written data. Each request runs
 * 20 times sequentially; the slowest observation must stay under 3,000 ms. The numbers
 * are printed to the CI log as one JSON line so they can be recorded in the docs.
 *
 * This is a measurement of the deployed Backend from the browser-facing API, not a
 * load test. It writes nothing.
 */
const backend = 'http://127.0.0.1:8080/api/v1';
const SAMPLES = 20;
const LIMIT_MS = 3000;

async function measure(label: string, run: () => Promise<number>) {
  const durations: number[] = [];

  for (let index = 0; index < SAMPLES; index += 1) {
    const started = performance.now();
    const status = await run();
    durations.push(performance.now() - started);
    expect(status, `${label} status`).toBeLessThan(400);
  }

  durations.sort((a, b) => a - b);
  const pick = (ratio: number) =>
    durations[Math.min(durations.length - 1, Math.floor(ratio * durations.length))]!;

  return {
    label,
    samples: SAMPLES,
    p50: Math.round(pick(0.5)),
    p95: Math.round(pick(0.95)),
    max: Math.round(durations.at(-1)!),
  };
}

async function bearer(request: APIRequestContext, loginId: string, password: string) {
  const response = await request.post(`${backend}/auth/login`, { data: { loginId, password } });
  expect(response.status()).toBe(200);
  return ((await response.json()) as { accessToken: string }).accessToken;
}

test('NFR-05 main Backend requests answer within 3 seconds', async ({ request }) => {
  const employeeLoginId = process.env.EMPLOYEE_LOGIN_ID ?? '';
  const employeePassword = process.env.EMPLOYEE_PASSWORD ?? '';
  expect(employeeLoginId, 'EMPLOYEE_LOGIN_ID').not.toBe('');

  const employeeToken = await bearer(request, employeeLoginId, employeePassword);
  const catalog = (await (await request.get(`${backend}/tours`)).json()) as Array<{ id: number }>;
  const tourId = catalog[0]!.id;
  const auth = { headers: { Authorization: `Bearer ${employeeToken}` } };

  const results = [
    await measure('GET /tours', async () => (await request.get(`${backend}/tours`)).status()),
    await measure('GET /tours/{id}', async () =>
      (await request.get(`${backend}/tours/${tourId}`)).status(),
    ),
    await measure('GET /tour-schedules?tourId', async () =>
      (await request.get(`${backend}/tour-schedules?tourId=${tourId}`)).status(),
    ),
    await measure('POST /auth/login', async () =>
      (
        await request.post(`${backend}/auth/login`, {
          data: { loginId: employeeLoginId, password: employeePassword },
        })
      ).status(),
    ),
    await measure('GET /employee/tours', async () =>
      (await request.get(`${backend}/employee/tours`, auth)).status(),
    ),
    await measure('GET /employee/inventory', async () =>
      (await request.get(`${backend}/employee/inventory`, auth)).status(),
    ),
  ];

  console.log(`NFR-05-RESULTS ${JSON.stringify(results)}`);

  for (const result of results) {
    expect(result.max, `${result.label} slowest of ${SAMPLES}`).toBeLessThan(LIMIT_MS);
  }
});
