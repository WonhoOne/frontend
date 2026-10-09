import { expect, test, type Locator, type Page } from '@playwright/test';

const storageKey = 'mister-world:reservation-draft:v1';
const readyDraft = {
  schemaVersion: 1,
  tourProductId: '103',
  tourScheduleId: '1301',
  tourStyle: 'PREMIUM',
  participantCount: 2,
  configuration: {
    hotelSelectionKey: 'HOTEL_5_STAR',
    transportSelectionKey: 'PREMIUM_VAN_10',
    mealSelectionKey: 'PREMIUM_RESTAURANT',
    extraSelectionKeys: [] as string[],
  },
  updatedAt: 1,
};
type BrowserMode = 'standard' | 'prefixed' | 'unsupported';
interface VoiceProbe {
  counts: { standard: number; prefixed: number; start: number; abort: number };
  say: (text: string, final?: boolean) => void;
  batch: (texts: string[]) => void;
  error: (code: string) => void;
  end: () => void;
  late: () => void;
  detached: () => boolean;
}

async function install(page: Page, mode: BrowserMode = 'standard', extras: string[] = []) {
  await page.addInitScript(
    ({ mode, key, draft, extras }) => {
      if (sessionStorage.getItem(key) === null) {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            ...draft,
            configuration: { ...draft.configuration, extraSelectionKeys: extras },
          }),
        );
      }
      const counts = { standard: 0, prefixed: 0, start: 0, abort: 0 };
      const sessions: { current?: Recognition; previous?: Recognition } = {};
      let lateResult: (() => void) | undefined;
      class Recognition {
        lang = '';
        continuous = false;
        interimResults = false;
        maxAlternatives = 1;
        onstart: (() => void) | null = null;
        onresult: ((event: unknown) => void) | null = null;
        onerror: ((event: { error: string }) => void) | null = null;
        onend: (() => void) | null = null;
        start() {
          sessions.current = this;
          counts.start++;
          this.onstart?.();
        }
        stop() {
          this.onend?.();
        }
        abort() {
          counts.abort++;
          sessions.previous = this;
          const callback = this.onresult;
          lateResult = () =>
            callback?.({
              resultIndex: 0,
              results: [{ isFinal: true, length: 1, 0: { transcript: '샴페인 추가' } }],
            });
          // Native end is asynchronous; tests explicitly release the session.
        }
      }
      class Standard extends Recognition {
        constructor() {
          super();
          counts.standard++;
        }
      }
      class Prefixed extends Recognition {
        constructor() {
          super();
          counts.prefixed++;
        }
      }
      Object.defineProperty(window, 'SpeechRecognition', {
        configurable: true,
        value: mode === 'standard' ? Standard : undefined,
      });
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        configurable: true,
        value: mode === 'unsupported' ? undefined : Prefixed,
      });
      Object.defineProperty(window, 'voiceV9', {
        value: {
          counts,
          say: (transcript: string, isFinal = true) =>
            sessions.current?.onresult?.({
              resultIndex: 0,
              results: [{ isFinal, length: 1, 0: { transcript, confidence: 1 } }],
            }),
          batch: (texts: string[]) =>
            sessions.current?.onresult?.({
              resultIndex: 0,
              results: texts.map((transcript) => ({ isFinal: true, length: 1, 0: { transcript } })),
            }),
          error: (error: string) => sessions.current?.onerror?.({ error }),
          end: () => sessions.current?.onend?.(),
          late: () => lateResult?.(),
          detached: () =>
            !!sessions.previous &&
            [
              sessions.previous.onstart,
              sessions.previous.onresult,
              sessions.previous.onerror,
              sessions.previous.onend,
            ].every((x) => x === null),
        },
      });
    },
    { mode, key: storageKey, draft: readyDraft, extras },
  );
}
async function probe(
  page: Page,
  action: 'say' | 'error' | 'end' | 'late' | 'batch',
  value = '',
  final = true,
) {
  await page.evaluate(
    ({ action, value, final }) => {
      const voice = (window as unknown as { voiceV9: VoiceProbe }).voiceV9;
      if (action === 'say') voice.say(value, final);
      else if (action === 'error') voice.error(value);
      else if (action === 'batch') voice.batch(value.split('|'));
      else voice[action]();
    },
    { action, value, final },
  );
}
async function draft(page: Page) {
  return page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key) ?? '{}') as typeof readyDraft,
    storageKey,
  );
}
async function counts(page: Page) {
  return page.evaluate(() => (window as unknown as { voiceV9: VoiceProbe }).voiceV9.counts);
}
async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 80; i++) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}
async function review(page: Page, width: number) {
  if (width < 1024) await page.getByRole('button', { name: 'Open trip summary' }).click();
  await page.getByRole('button', { name: 'Review trip', exact: true }).click();
  await expect(page).toHaveURL(/\/reservation\/review$/);
}
async function geometry(page: Page) {
  const region = page.getByRole('region', { name: 'Voice trip choices' });
  await expect(region).toBeVisible();
  for (const name of ['Start voice', 'Stop voice']) {
    const button = region.getByRole('button', { name });
    await expect(button).toHaveJSProperty('tagName', 'BUTTON');
    const rect = await button.boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.width).toBeGreaterThanOrEqual(44);
    expect(rect!.height).toBeGreaterThanOrEqual(44);
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
}

for (const mode of ['standard', 'prefixed', 'unsupported'] as const) {
  test('V9 browser detection: ' + mode + ', GUI and Draft remain usable', async ({ page }) => {
    await install(page, mode);
    await page.goto('/tours/103/configure');
    await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeVisible();
    const before = await draft(page);
    await page.getByRole('button', { name: 'Start voice' }).click();
    const region = page.getByRole('region', { name: 'Voice trip choices' });
    if (mode === 'unsupported') {
      await expect(region.getByRole('status')).toContainText('unavailable in this browser');
      await expect(region.getByRole('button', { name: 'Start voice' })).toBeEnabled();
      await expect(region.getByRole('button', { name: 'Stop voice' })).toBeDisabled();
    } else {
      await expect(region.getByRole('status')).toHaveText('Listening…');
      await expect(region.getByRole('button', { name: 'Start voice' })).toBeDisabled();
      await expect(region.getByRole('button', { name: 'Stop voice' })).toBeEnabled();
    }
    expect(await counts(page)).toMatchObject({
      standard: mode === 'standard' ? 1 : 0,
      prefixed: mode === 'prefixed' ? 1 : 0,
    });
    expect(await draft(page)).toEqual(before);
    await page.getByRole('checkbox', { name: /Coffee/ }).check();
    await review(page, 1280);
  });
}

for (const error of [
  'not-allowed',
  'audio-capture',
  'no-speech',
  'network',
  'aborted',
  'unknown-native-detail',
]) {
  test('V9 ' + error + ': no Draft mutation, restart and GUI fallback', async ({ page }) => {
    await install(page);
    await page.goto('/tours/103/configure');
    const participant = page.getByRole('spinbutton', { name: 'Participants' });
    await expect(participant).toBeVisible();
    const before = await draft(page);
    await page.getByRole('button', { name: 'Start voice' }).click();
    await participant.focus();
    await probe(page, 'error', error);
    await expect(
      page.getByRole('region', { name: 'Voice trip choices' }).getByRole('status'),
    ).toContainText('recognition failed');
    await expect(participant).toBeFocused();
    await probe(page, 'say', '샴페인 추가');
    expect(await draft(page)).toEqual(before);
    await probe(page, 'end');
    await tabTo(page, page.getByRole('button', { name: 'Start voice' }));
    await page.keyboard.press('Enter');
    await probe(page, 'say', '커피 추가');
    await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeChecked();
    expect((await counts(page)).start).toBe(2);
    await page.getByRole('radio', { name: /4-star hotel/ }).check();
    await review(page, 1280);
  });
}

test('V9 keyboard, asynchronous Stop/restart, status semantics and focus preservation', async ({
  page,
}) => {
  await install(page);
  await page.goto('/tours/103/configure');
  const region = page.getByRole('region', { name: 'Voice trip choices' });
  const start = region.getByRole('button', { name: 'Start voice' });
  const stop = region.getByRole('button', { name: 'Stop voice' });
  await tabTo(page, start);
  await page.keyboard.press('Space');
  await expect(start).toBeDisabled();
  await tabTo(page, stop);
  await page.keyboard.press('Enter');
  await expect(start).toBeDisabled();
  await probe(page, 'late');
  expect((await draft(page)).configuration.extraSelectionKeys).toEqual([]);
  await probe(page, 'end');
  await expect(start).toBeEnabled();
  await tabTo(page, start);
  await page.keyboard.press('Enter');
  const participant = page.getByRole('spinbutton', { name: 'Participants' });
  await participant.focus();
  await probe(page, 'say', '커피 추가', false);
  await expect(region.getByText('Heard: 커피 추가')).toBeVisible();
  await expect(region.getByRole('status')).toHaveText('Listening…');
  expect((await draft(page)).configuration.extraSelectionKeys).toEqual([]);
  await probe(page, 'say', '커피 추가');
  await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeChecked();
  await expect(participant).toBeFocused();
  await probe(page, 'end');
  await expect(participant).toBeFocused();
  await expect(region.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  expect(await region.locator('[aria-live]').count()).toBe(1);
  expect(await region.getByText('Heard: 커피 추가').getAttribute('aria-live')).toBeNull();
  expect(await counts(page)).toMatchObject({ start: 2, abort: 1, standard: 2 });
});

test('V9 batched finals commit in order, GUI edits stay fresh, submit intents never POST', async ({
  page,
}) => {
  await install(page);
  const posts: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'POST') posts.push(req.url());
  });
  await page.goto('/tours/103/configure');
  await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeVisible();
  await page.getByRole('button', { name: 'Start voice' }).click();
  await probe(page, 'batch', '샴페인 추가|커피 추가|샴페인 제거');
  expect((await draft(page)).configuration.extraSelectionKeys).toEqual(['COFFEE']);
  await page.getByRole('checkbox', { name: /Champagne/ }).check();
  await probe(page, 'batch', '샴페인 제거|커피 제거|커피 제거');
  expect((await draft(page)).configuration.extraSelectionKeys).toEqual([]);
  const before = await draft(page);
  for (const phrase of [
    '예약해줘',
    '신청해줘',
    'submit',
    'book it',
    '결제해줘',
    '무슨 말',
    '인원 99명',
    '호텔 8성급 선택',
    '상품 없는상품 선택',
    '2027년 1월 1일 일정 선택',
  ]) {
    await probe(page, 'say', phrase);
    expect(await draft(page)).toEqual(before);
    await expect(page).toHaveURL(/\/tours\/103\/configure$/);
  }
  expect(posts).toEqual([]);
  await page.getByRole('checkbox', { name: /Coffee/ }).check();
  await review(page, 1280);
  expect(posts).toEqual([]);
  await expect(page.getByRole('region', { name: 'Voice trip choices' })).toHaveCount(0);
  const atReview = await draft(page);
  await probe(page, 'late');
  expect(await draft(page)).toEqual(atReview);
  await probe(page, 'end');
  expect(
    await page.evaluate(() => (window as unknown as { voiceV9: VoiceProbe }).voiceV9.detached()),
  ).toBe(true);
  await page.goBack();
  await page.getByRole('button', { name: 'Start voice' }).click();
  await probe(page, 'say', '커피 제거');
  await expect(page.getByRole('checkbox', { name: /Coffee/ })).not.toBeChecked();
});

test('V9 unknown historical Extra stays intact until explicit GUI recovery', async ({ page }) => {
  await install(page, 'standard', ['UNKNOWN_HISTORICAL', 'COFFEE']);
  await page.goto('/tours/103/configure');
  await page.getByRole('button', { name: 'Start voice' }).click();
  await probe(page, 'say', '샴페인 제거');
  expect((await draft(page)).configuration.extraSelectionKeys).toEqual([
    'UNKNOWN_HISTORICAL',
    'COFFEE',
  ]);
  await expect(page.getByRole('button', { name: 'Review trip', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Remove unavailable extra' }).click();
  expect((await draft(page)).configuration.extraSelectionKeys).toEqual(['COFFEE']);
  await review(page, 1280);
});

for (const width of [320, 390, 768, 1023, 1024, 1280, 640]) {
  test(
    'V9 ' + width + 'px: Voice, GUI, CTA, reduced motion and Review continuity',
    async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await install(page);
      await page.goto('/tours/103');
      await geometry(page);
      await page.getByRole('button', { name: 'Configure this trip' }).click();
      await geometry(page);
      await page.getByRole('button', { name: 'Start voice' }).click();
      await probe(page, 'say', '커피 추가');
      await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeChecked();
      await page.getByRole('button', { name: 'Stop voice' }).click();
      await probe(page, 'end');
      await page.getByRole('checkbox', { name: /Champagne/ }).check();
      await page.getByRole('button', { name: 'Start voice' }).click();
      await probe(page, 'say', '샴페인 제거');
      await expect(page.getByRole('checkbox', { name: /Champagne/ })).not.toBeChecked();
      await geometry(page);
      // Detail's explicit Configure action starts a journey; complete its GUI choices.
      await page.getByRole('spinbutton', { name: 'Participants' }).fill('2');
      await page.getByRole('radio', { name: /Premium van/ }).check();
      await review(page, width);
    },
  );
}

test('V9 discovery navigation preserves Draft and uses the existing theme query', async ({
  page,
}) => {
  await install(page);
  await page.goto('/');
  const before = await draft(page);
  await page.getByRole('button', { name: 'Start voice' }).click();
  await probe(page, 'say', '상품 보여줘');
  await expect(page).toHaveURL(/\/tours$/);
  expect(await draft(page)).toEqual(before);
  await expect(
    page.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
  ).toBeVisible();
  await probe(page, 'say', '골프 테마 선택');
  await expect(page).toHaveURL(/\/tours\?theme=GOLF_CHALLENGE$/);
  expect(await draft(page)).toEqual(before);
  await probe(page, 'say', '상품 없는상품 선택');
  await expect(page).toHaveURL(/\/tours\?theme=GOLF_CHALLENGE$/);
  expect(await draft(page)).toEqual(before);
  await probe(page, 'say', '상품 Golf Challenge · Journey 01 선택');
  await expect(page).toHaveURL(/\/tours\/103$/);
  expect((await draft(page)).tourProductId).toBe('103');
});

test('V9 Detail and Configure share committed GUI choices in both directions', async ({ page }) => {
  await install(page);
  await page.goto('/tours/103');
  const grand = page.getByRole('radio', { name: /Grand/ });
  const premium = page.getByRole('radio', { name: /Premium/ });
  const schedule = page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ });
  await expect(grand).toBeVisible();
  await page.getByRole('button', { name: 'Start voice' }).click();
  await probe(page, 'say', '그랜드 스타일 선택');
  await expect(grand).toBeChecked();
  await premium.check();
  await probe(page, 'say', '2027년 3월 10일 일정 선택');
  await expect(schedule).toBeChecked();
  expect(await draft(page)).toMatchObject({ tourStyle: 'PREMIUM', tourScheduleId: '1301' });
  await schedule.check();
  await probe(page, 'say', '그랜드 스타일 선택');
  expect(await draft(page)).toMatchObject({ tourStyle: 'GRAND', tourScheduleId: '1301' });
  await page.getByRole('button', { name: 'Configure this trip' }).click();
  const participants = page.getByRole('spinbutton', { name: 'Participants' });
  await participants.fill('4');
  const hotel = page.getByRole('radio', { name: /4-star hotel/ });
  const transport = page.getByRole('radio', { name: /Premium van/ });
  const meal = page.getByRole('radio', { name: /Local restaurant/ });
  await hotel.check();
  await transport.check();
  await meal.check();
  await probe(page, 'say', '커피 추가');
  await expect(transport).toBeChecked();
  expect((await draft(page)).participantCount).toBe(4);
  await participants.fill('2');
  await probe(page, 'say', '차량 2인 고급차량 선택');
  await expect(page.getByRole('radio', { name: /Private luxury car/ })).toBeChecked();
  await probe(page, 'batch', '인원 2명|5성급 호텔로 변경|식사 고급 레스토랑 선택');
  await expect(participants).toHaveValue('2');
  await expect(page.getByRole('radio', { name: /5-star hotel/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Premium restaurant/ })).toBeChecked();
  await hotel.check();
  await transport.check();
  await meal.check();
  await probe(page, 'say', '커피 추가');
  expect((await draft(page)).configuration).toMatchObject({
    hotelSelectionKey: 'HOTEL_4_STAR',
    transportSelectionKey: 'PREMIUM_VAN_10',
    mealSelectionKey: 'LOCAL_RESTAURANT',
    extraSelectionKeys: ['COFFEE'],
  });
});

for (const route of [
  '/login',
  '/signup',
  '/my-trips',
  '/reservation/review',
  '/reservations/801',
  '/reservation/801/success',
  '/employee',
]) {
  test('V9 has no Voice lifetime at ' + route, async ({ page }) => {
    await install(page);
    await page.goto(route);
    await expect(page.getByRole('region', { name: 'Voice trip choices' })).toHaveCount(0);
    expect((await counts(page)).start).toBe(0);
  });
}

test('V9 transcript stays ephemeral and interpretation adds no application network requests', async ({
  page,
}) => {
  await install(page);
  await page.goto('/tours/103/configure');
  await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeVisible();
  await page.getByRole('button', { name: 'Start voice' }).click();
  const requests: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr'].includes(request.resourceType())) requests.push(request.url());
  });
  const transcript = 'V9-PRIVATE-TRANSCRIPT-DO-NOT-RETAIN';
  await probe(page, 'say', transcript);
  await expect(page.getByText('Heard: ' + transcript)).toBeVisible();
  expect(
    await page.evaluate(
      (text) =>
        [localStorage, sessionStorage].some((storage) =>
          Object.values(storage).some((value) => String(value).includes(text)),
        ),
      transcript,
    ),
  ).toBe(false);
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Stop voice' }).click();
  await probe(page, 'end');
  await page.getByRole('button', { name: 'Start voice' }).click();
  await expect(page.getByText('Heard: ' + transcript)).toHaveCount(0);
});
