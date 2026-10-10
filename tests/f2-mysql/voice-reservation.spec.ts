import { expect, test, type Page } from '@playwright/test';

const backend = 'http://127.0.0.1:8080/api/v1';
const storageKey = 'mister-world:reservation-draft:v1';
const account = {
  loginId: 'b9-d-voice-customer',
  password: 'b9-d-test-only-password',
  name: 'Synthetic Voice Customer',
  address: 'Synthetic integration address',
  contact: '01000000002',
};
const configuration = {
  style: 'PREMIUM',
  hotelOption: 'HOTEL_4_STAR',
  transportOption: 'PRIVATE_LUXURY_CAR_2',
  mealOption: 'LOCAL_RESTAURANT',
  extraOptions: ['COFFEE'],
};

interface Schedule {
  id: number;
  tourId: number;
  startDate: string;
  endDate: string;
  reservable: boolean;
  recruitment: { currentCount: number };
}
interface Draft {
  tourProductId: string;
  tourScheduleId: string;
  tourStyle: string;
  participantCount: number;
  configuration: {
    hotelSelectionKey: string;
    transportSelectionKey: string;
    mealSelectionKey: string;
    extraSelectionKeys: string[];
  };
}

// CI has no microphone. Only the native recognition boundary is replaced;
// transcripts still enter the production adapter → runtime → interpreter → bridge.
async function installRecognition(page: Page) {
  await page.addInitScript(() => {
    class Recognition {
      static current: Recognition | undefined;
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onstart: (() => void) | null = null;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        Recognition.current = this;
        this.onstart?.();
      }
      stop() {
        this.onend?.();
      }
      abort() {
        this.onend?.();
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', { value: Recognition });
    Object.defineProperty(window, 'b9Voice', {
      value: (transcript: string) => {
        if (!Recognition.current?.onresult) throw new Error('Recognition is not listening');
        Recognition.current.onresult({
          resultIndex: 0,
          results: [{ isFinal: true, length: 1, 0: { transcript, confidence: 1 } }],
        });
      },
    });
  });
}
async function say(page: Page, transcript: string) {
  await page.evaluate((text) => {
    (window as unknown as { b9Voice: (text: string) => void }).b9Voice(text);
  }, transcript);
}
async function readDraft(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key) ?? '{}') as Draft,
    storageKey,
  );
}

// Own account; no dependence on the authenticated scenario's reservation fixtures.
// No API response interception, Draft writes, or API-created reservations.
test('B9-D real MySQL Voice choices require explicit GUI reservation submit', async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(120_000);
  expect(process.env.VITE_ENABLE_MOCKS, 'B9-D requires the live application').toBe('false');
  expect(process.env.SMS_DELIVERY_ENABLED, 'Billable SMS must be disabled').toBe('false');
  await expect
    .poll(
      async () => {
        try {
          return (await request.get(backend + '/tours')).status();
        } catch {
          return 0;
        }
      },
      { timeout: 90_000 },
    )
    .toBe(200);

  const catalog = (await (await request.get(backend + '/tours')).json()) as Array<{
    id: number;
    name: string;
  }>;
  expect(catalog).toHaveLength(1);
  const product = catalog[0]!;
  expect(product.name).toBe('F2 Synthetic Golf');
  const schedulesResponse = await request.get(backend + '/tour-schedules?tourId=' + product.id);
  expect(schedulesResponse.status()).toBe(200);
  const schedules = (await schedulesResponse.json()) as Schedule[];
  expect(schedules).toHaveLength(1);
  const schedule = schedules[0]!;
  expect(schedule.tourId).toBe(product.id);
  expect(schedule.reservable).toBe(true);

  await installRecognition(page);
  const posts: unknown[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST' && new URL(req.url()).pathname === '/api/v1/reservations') {
      posts.push(req.postDataJSON());
    }
  });
  await page.goto('/signup');
  await page.getByRole('textbox', { name: '로그인 ID' }).fill(account.loginId);
  await page.getByLabel('비밀번호').fill(account.password);
  await page.getByRole('textbox', { name: '성명' }).fill(account.name);
  await page.getByRole('textbox', { name: '주소' }).fill(account.address);
  await page.getByRole('textbox', { name: '연락처' }).fill(account.contact);
  await page.getByRole('button', { name: '회원가입' }).click();
  await expect(page).toHaveURL('/login');

  // This token is only for persistence GET probes. Browser login happens later,
  // and only the real GUI Submit is allowed to create the reservation.
  const tokenResponse = await request.post(backend + '/auth/login', {
    data: { loginId: account.loginId, password: account.password },
  });
  expect(tokenResponse.status()).toBe(200);
  const session = (await tokenResponse.json()) as { accessToken: string; user: { role: string } };
  expect(session.user.role).toBe('CUSTOMER');
  const authorization = { Authorization: 'Bearer ' + session.accessToken };

  const browserCatalogPromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/v1/tours' && response.request().method() === 'GET',
  );
  await page.goto('/tours');
  const browserCatalog = await browserCatalogPromise;
  expect(browserCatalog.status()).toBe(200);
  expect(browserCatalog.fromServiceWorker()).toBe(false);
  expect(await browserCatalog.json()).toEqual(catalog);
  await expect(
    page.getByRole('link', { name: 'View ' + product.name + ' tour details' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem('mister-world:reservation-draft:v1')),
  ).toBeNull();
  await page.getByRole('button', { name: 'Start voice' }).click();
  const browserSchedulesPromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === '/api/v1/tour-schedules' &&
      url.searchParams.get('tourId') === String(product.id)
    );
  });
  await say(page, '상품 ' + product.name + ' 선택');
  await expect(page).toHaveURL('/tours/' + product.id);
  await expect(page.getByRole('heading', { level: 1, name: product.name })).toBeVisible();
  const browserSchedules = await browserSchedulesPromise;
  expect(browserSchedules.status()).toBe(200);
  expect(browserSchedules.fromServiceWorker()).toBe(false);
  expect(await browserSchedules.json()).toEqual(schedules);
  const scheduleRadio = page.getByRole('radio', { name: new RegExp(schedule.startDate) });
  // The date is supplied by the generated Backend scenario, never a fixture ID.
  await expect(scheduleRadio).toBeVisible();
  await say(page, '프리미엄 스타일 선택');
  await expect(page.getByRole('radio', { name: /Premium/ })).toBeChecked();
  const [year, month, day] = schedule.startDate.split('-').map(Number);
  await say(page, year + '년 ' + month + '월 ' + day + '일 일정 선택');
  await expect(scheduleRadio).toBeChecked();
  expect(await readDraft(page)).toMatchObject({
    tourProductId: String(product.id),
    tourScheduleId: String(schedule.id),
    tourStyle: 'PREMIUM',
  });
  await page.getByRole('button', { name: 'Configure this trip' }).click();
  await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();
  const champagne = page.getByRole('checkbox', { name: /Champagne/ });
  const coffee = page.getByRole('checkbox', { name: /Coffee/ });
  await expect(champagne).toBeChecked();
  await say(page, '인원 2명');
  await expect(page.getByRole('spinbutton', { name: 'Participants' })).toHaveValue('2');
  await say(page, '호텔 4성급 선택');
  await expect(page.getByRole('radio', { name: /4-star hotel/ })).toBeChecked();
  await say(page, '차량 2인 고급차량 선택');
  await expect(page.getByRole('radio', { name: /Private luxury car/ })).toBeChecked();
  await say(page, '식사 현지식 레스토랑 선택');
  await expect(page.getByRole('radio', { name: /Local restaurant/ })).toBeChecked();
  await say(page, '커피 추가');
  await expect(coffee).toBeChecked();
  await say(page, '커피 추가');
  expect((await readDraft(page)).configuration.extraSelectionKeys).toEqual(['CHAMPAGNE', 'COFFEE']);
  await say(page, '샴페인 제거');
  await expect(champagne).not.toBeChecked();
  const voiceDraft = await readDraft(page);
  expect(voiceDraft).toMatchObject({
    tourProductId: String(product.id),
    tourScheduleId: String(schedule.id),
    tourStyle: configuration.style,
    participantCount: 2,
    configuration: {
      hotelSelectionKey: configuration.hotelOption,
      transportSelectionKey: configuration.transportOption,
      mealSelectionKey: configuration.mealOption,
      extraSelectionKeys: configuration.extraOptions,
    },
  });

  const beforeVoiceSubmit = (await (
    await request.get(backend + '/tour-schedules/' + schedule.id)
  ).json()) as Schedule;
  await say(page, '예약해 줘');
  await expect(page.getByRole('status').filter({ hasText: 'not understood' })).toBeVisible();
  await expect(page.getByText('Heard: 예약해 줘')).toBeVisible();
  await expect(page).toHaveURL('/tours/' + product.id + '/configure');
  await expect(page.getByRole('button', { name: 'Apply for reservation' })).toHaveCount(0);
  expect(posts).toEqual([]);
  expect(await readDraft(page)).toEqual(voiceDraft);
  const afterVoiceSubmit = (await (
    await request.get(backend + '/tour-schedules/' + schedule.id)
  ).json()) as Schedule;
  expect(afterVoiceSubmit.recruitment).toEqual(beforeVoiceSubmit.recruitment);

  // Reload proves persisted Voice choices cannot be overwritten by stale GUI defaults.
  await page.reload();
  await expect(champagne).not.toBeChecked();
  await expect(coffee).toBeChecked();
  await expect(page.getByRole('radio', { name: /Private luxury car/ })).toBeChecked();
  expect(await readDraft(page)).toEqual(voiceDraft);
  await page.getByRole('button', { name: 'Review trip' }).click();
  await expect(page).toHaveURL('/reservation/review');
  const assertReview = async () => {
    await expect(page.getByRole('heading', { name: 'Review your trip' })).toBeVisible();
    const trip = page.locator('section[aria-labelledby="review-trip"]');
    const choices = page.locator('section[aria-labelledby="review-configuration"]');
    await expect(trip.getByText('Premium', { exact: true })).toBeVisible();
    await expect(trip.getByText('2 participants', { exact: true })).toBeVisible();
    for (const label of ['4-star hotel', 'Private luxury car (2)', 'Local restaurant', 'Coffee']) {
      await expect(choices.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(choices.getByText(/Champagne/)).toHaveCount(0);
    expect(await readDraft(page)).toEqual(voiceDraft);
  };
  await assertReview();
  // Soft checks retain downstream submit/persistence diagnostics, but still fail
  // the gate if a human cannot identify the actual product/date on Review.
  await expect
    .soft(
      page.locator('section[aria-labelledby="review-trip"]'),
      'B9-D BLOCKER: Review must identify the real product',
    )
    .toContainText(product.name);
  await expect
    .soft(
      page.locator('section[aria-labelledby="review-trip"]'),
      'B9-D BLOCKER: Review must identify the selected schedule',
    )
    .toContainText(schedule.startDate);
  expect(posts).toEqual([]);

  await page.getByRole('button', { name: 'Apply for reservation' }).click();
  await expect(page).toHaveURL('/login');
  expect(posts).toEqual([]);
  expect(await readDraft(page)).toEqual(voiceDraft);
  await page.getByRole('textbox', { name: '로그인 ID' }).fill(account.loginId);
  await page.getByLabel('비밀번호').fill(account.password);
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL('/reservation/review');
  await assertReview();
  expect(posts).toEqual([]);

  const creationPromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/v1/reservations' &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Apply for reservation' }).click();
  const creation = await creationPromise;
  expect(creation.status()).toBe(201);
  const created = (await creation.json()) as { id: number };
  expect(created.id).toBeGreaterThan(0);
  await expect(page).toHaveURL('/reservation/' + created.id + '/success');
  await expect(page.getByRole('heading', { name: 'Reservation received' })).toBeVisible();
  expect(posts).toEqual([{ scheduleId: schedule.id, participantCount: 2, configuration }]);
  const savedResponse = await request.get(backend + '/reservations/' + created.id, {
    headers: authorization,
  });
  expect(savedResponse.status()).toBe(200);
  const saved: unknown = await savedResponse.json();
  expect(saved).toEqual(created);
  expect(saved).toMatchObject({
    id: created.id,
    participantCount: 2,
    tourProduct: { id: product.id, name: product.name, theme: 'GOLF_CHALLENGE' },
    schedule: { id: schedule.id, startDate: schedule.startDate, endDate: schedule.endDate },
    configuration,
  });
  expect(await page.evaluate((key) => sessionStorage.getItem(key), storageKey)).toBeNull();
  await page.getByRole('link', { name: 'View reservation details' }).click();
  await expect(page).toHaveURL('/reservations/' + created.id);
  await expect(page.getByRole('heading', { level: 1, name: product.name })).toBeVisible();
  await expect(page.getByText('Reservation #' + created.id, { exact: true })).toBeVisible();
  expect(posts).toHaveLength(1);
  await testInfo.attach('b9-d-persistence-evidence', {
    contentType: 'application/json',
    body: JSON.stringify(
      {
        transcriptSource: 'deterministic SpeechRecognition stub',
        voiceDraft,
        voiceReservationPosts: 0,
        guiReservationPosts: posts,
        persisted: saved,
      },
      null,
      2,
    ),
  });
});
