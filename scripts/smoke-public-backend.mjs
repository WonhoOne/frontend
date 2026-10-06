import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const baseUrl = (process.env.BACKEND_SMOKE_BASE_URL ?? 'http://127.0.0.1:8080/api/v1').replace(
  /\/$/,
  '',
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertApiError(body, expectedCode) {
  assert(isRecord(body), 'ApiError body must be an object.');
  assert(body.code === expectedCode, `Expected ApiError code ${expectedCode}, received ${String(body.code)}.`);
  assert(typeof body.message === 'string', 'ApiError.message must be a string.');
  assert(Array.isArray(body.fieldErrors), 'ApiError.fieldErrors must always be an array.');
}

function assertProduct(product) {
  assert(isRecord(product), 'TourProduct must be an object.');
  assert(Number.isSafeInteger(product.id) && product.id > 0, 'TourProduct.id must be a positive safe integer.');
  assert(typeof product.theme === 'string', 'TourProduct.theme must be a string enum value.');
  assert(typeof product.name === 'string', 'TourProduct.name must be a string.');
  assert(typeof product.description === 'string', 'TourProduct.description must be a string.');
  assert(Array.isArray(product.availableStyles), 'TourProduct.availableStyles must be an array.');
  assert(Array.isArray(product.stylePrices), 'TourProduct.stylePrices must be an array.');
}

function assertSchedule(schedule, expectedTourId) {
  assert(isRecord(schedule), 'TourSchedule must be an object.');
  assert(Number.isSafeInteger(schedule.id) && schedule.id > 0, 'TourSchedule.id must be a positive safe integer.');
  assert(schedule.tourId === expectedTourId, 'TourSchedule.tourId must match the requested TourProduct.');
  assert(typeof schedule.startDate === 'string', 'TourSchedule.startDate must be a string.');
  assert(typeof schedule.endDate === 'string', 'TourSchedule.endDate must be a string.');
  assert(typeof schedule.reservable === 'boolean', 'TourSchedule.reservable must be boolean.');
  assert(isRecord(schedule.recruitment), 'TourSchedule.recruitment must be an object.');
  assert(typeof schedule.recruitment.confirmed === 'boolean', 'recruitment.confirmed must be boolean.');
}

async function readJson(path, expectedStatus) {
  const response = await globalThis.fetch(`${baseUrl}${path}`);
  const contentType = response.headers.get('content-type') ?? '';
  assert(
    contentType.toLowerCase().includes('application/json'),
    `${path} must return application/json, received ${contentType || '<missing>'}.`,
  );

  const body = await response.json();
  assert(
    response.status === expectedStatus,
    `${path} expected HTTP ${expectedStatus}, received ${response.status}: ${JSON.stringify(body)}`,
  );

  return body;
}

async function waitForBackend() {
  const deadline = Date.now() + 60_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await globalThis.fetch(`${baseUrl}/tours`);
      if (response.status === 200) return;
      lastError = new Error(`Backend returned HTTP ${response.status} while starting.`);
    } catch (error) {
      lastError = error;
    }

    await delay(1_000);
  }

  throw new Error(`Backend did not become ready within 60s: ${String(lastError)}`);
}

await waitForBackend();

const products = await readJson('/tours', 200);
assert(Array.isArray(products), 'GET /tours must return a plain array.');
products.forEach(assertProduct);

if (products.length > 0) {
  const productId = products[0].id;
  const detail = await readJson(`/tours/${productId}`, 200);
  assertProduct(detail);
  assert(detail.id === productId, 'TourProduct detail identity must match the requested ID.');

  const schedules = await readJson(`/tour-schedules?tourId=${productId}`, 200);
  assert(Array.isArray(schedules), 'Filtered TourSchedule response must be an array.');
  schedules.forEach((schedule) => assertSchedule(schedule, productId));
} else {
  const missing = await readJson('/tours/1', 404);
  assertApiError(missing, 'TOUR_PRODUCT_NOT_FOUND');

  const schedules = await readJson('/tour-schedules?tourId=1', 200);
  assert(Array.isArray(schedules) && schedules.length === 0, 'Unknown positive tourId must return [].');
}

const invalidQuery = await readJson('/tour-schedules?tourId=0', 400);
assertApiError(invalidQuery, 'INVALID_QUERY_PARAMETER');

globalThis.console.log(
  `F1 public Backend smoke passed against ${baseUrl} (products=${products.length}).`,
);
